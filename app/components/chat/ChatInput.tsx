import { Button } from "../ui/button";
import { ChangeEvent, useEffect, useRef, useState } from "react";
import { cn } from "~/lib/utils";
import { toast } from "sonner";
import { useChatStore } from "~/store";
import {
  ChatContentType,
  content_type,
  FileInfoInter,
  MessageApiInter,
  MessageInter,
  object_string_type,
  ResponseMessageType,
  ResponseRetrieveInter,
} from "~/types";
import TextareaAutosize from "react-textarea-autosize";
import { PaperclipIcon, SendIcon, StopCircleIcon } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "~/components/ui/tooltip";
import FileCard from "~/components/chat/FileCard";
import { parseSSEResponse } from "~/utils/sse";
import { allowFileList, allowImageList } from "~/utils/file";
import { PhotoIcon } from "@heroicons/react/24/outline";
import { ChatError } from "~/utils/error";
import { cloneDeep } from "lodash-es";
import {
  asyncChat,
  asyncRefreshToken,
  asyncRetrievePolling,
} from "~/apis/data";
import ImageCard from "./ImageCard";
import { getStorageSetting, updateTwoToken } from "~/utils/storage";

// 聊天输入组件
export default function ChatInput({ type }: ChatContentType) {
  // 输入框内容
  const [prompt, setPrompt] = useState("");
  // 输入框引用
  const inputRef = useRef<HTMLTextAreaElement>(null);
  // 是否正在发送
  const [isLoading, setIsLoading] = useState(false);
  // 文件列表
  const [files, setFiles] = useState<FileInfoInter[]>([]);
  // 图片列表
  const [images, setImages] = useState<FileInfoInter[]>([]);
  // 消息列表
  const [messages, setMessages] = useState<MessageApiInter[]>([]);
  // 取消控制器
  const [abort_controller, setAbortController] = useState<AbortController>();
  // 聊天存储
  const store = useChatStore();

  // 输入框聚焦
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  // 发送消息
  useEffect(() => {
    if (store.sendMessageFlag && type === "page")
      sendMessage(store.sendMessageFlag);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [store.sendMessageFlag]);

  // 发送消息
  useEffect(() => {
    if (store.sendMessageFlagInline && type === "inline")
      sendMessage(store.sendMessageFlagInline);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [store.sendMessageFlagInline]);

  // 构建消息内容
  const buildContent = (
    text: string,
    fileList: FileInfoInter[],
    imageList: FileInfoInter[]
  ) => {
    const arr = [];
    let content_type: content_type = "text";
    if (text)
      arr.push({
        type: "text",
        text,
      });
    if (fileList.length > 0) {
      content_type = "object_string";
      fileList.forEach((fileInfo) => {
        if (fileInfo.status == "uploaded")
          arr.push({
            type: "file",
            file_id: fileInfo.file_id,
          });
      });
    }
    if (imageList.length > 0) {
      content_type = "object_string";
      imageList.forEach((fileInfo) => {
        if (fileInfo.status == "uploaded")
          arr.push({
            type: "image",
            file_id: fileInfo.file_id,
          });
      });
    }
    return { arr, content_type };
  };
  const buildMessage = (v?: string) => {
    const { arr, content_type } = buildContent(v || prompt, files, images);
    return {
      role: "user",
      content: JSON.stringify(arr),
      content_type,
    } as MessageApiInter;
  };
  const resetInput = () => {
    setPrompt("");
    setFiles([]);
    setImages([]);
  };
  const sendMessage = async (v?: string) => {
    setIsLoading(true);
    resetInput();
    const abort_controller = new AbortController();
    setAbortController(abort_controller);
    const user: MessageInter = {
      role: "user",
      text: v || prompt,
      files,
      images,
    };
    const result: MessageInter = {
      role: "assistant",
      text: "",
      suggestions: [],
    };
    updateStoreMessage(user, result);
    const newMessage = buildMessage(v);
    const _messages = [...messages, newMessage];
    await getResonse(_messages, abort_controller, user, result);
  };
  const getResonse = async (
    _messages: MessageApiInter[],
    abort_controller: AbortController,
    user: MessageInter,
    result: MessageInter
  ) => {
    try {
      const res = await asyncChat(_messages, abort_controller);
      console.log("res", res);
      const contentType = res.headers.get("Content-Type");
      if (contentType?.includes("text/event-stream")) {
        await handleSSEResponse(res, user, result, _messages);
      } else {
        const jsonData = await res.json();
        if (!getStorageSetting()?.stream && jsonData.code === 0) {
          const res: ResponseRetrieveInter = await asyncRetrievePolling(
            jsonData.data.conversation_id,
            jsonData.data.id
          );
          if (res.code !== 0) throw new Error(res.msg || "Request failed");
          else {
            const { data } = res;
            const answer = data.find((item) => item.type === "answer");
            if (answer) result.text = answer.content;
            const follow_up = data.filter((item) => item.type === "follow_up");
            if (follow_up)
              result.suggestions = follow_up.map((item) => item.content);
            setMessages([
              ..._messages,
              { role: "assistant", content: result.text } as MessageApiInter,
            ]);
          }
        } else if (jsonData.code == 4100) {
          if (getStorageSetting()?.auth_type == "one") {
            throw new Error(
              "Please set the correct token in the settings page！！！"
            );
          } else {
            const res = await asyncRefreshToken();
            const data = await res.json();
            if (data.access_token) {
              updateTwoToken(data.access_token, data.refresh_token);
              // Resend message
              await getResonse(_messages, abort_controller, user, result);
            } else throw new Error(data.error_message);
          }
        } else throw new Error(jsonData.msg || "Request failed");
      }
    } catch (err) {
      const error = ChatError.fromError(err);
      console.log("error", error);
      // If the request is aborted, display part of the content, do not display the error
      if (error.message == "BodyStreamBuffer was aborted") return;
      result.error = error.message;
      updateStoreMessage(user, result);
    } finally {
      if (store.sendMessageFlag) store.setSendMessageFlag("");
      if (store.sendMessageFlagInline) store.setSendMessageFlagInline("");
      if (result.suggestions?.length == 0) result.suggestions = undefined;
      updateStoreMessage(user, result);
      setIsLoading(false);
    }
  };
  const handleSSEResponse = async (
    res: Response,
    user: MessageInter,
    result: MessageInter,
    _messages: MessageApiInter[]
  ) => {
    await parseSSEResponse(res, (message) => {
      if (message.includes("[DONE]")) {
        setMessages([
          ..._messages,
          { role: "assistant", content: result.text } as MessageApiInter,
        ]);
        return;
      }
      let data: ResponseMessageType;
      try {
        data = JSON.parse(message);
      } catch (err) {
        throw new Error("Parsing failed");
      }
      if (["answer"].includes(data?.type) && !data.created_at) {
        result.text += data?.content;
        updateStoreMessage(user, result);
      } else if (data?.type === "follow_up") {
        result.suggestions?.push(data.content);
      } else if (data?.status == "failed") {
        throw new Error(data.last_error!.msg);
      }
    });
  };
  const abortChat = () => {
    if (abort_controller) abort_controller.abort();
  };
  const updateStoreMessage = (user: MessageInter, result?: MessageInter) => {
    if (result) {
      if (type === "page") store.setMessages([...store.messages, user, result]);
      else if (type === "inline")
        store.setMessagesInline([...store.messages_inline, user, result]);
    } else {
      if (type === "page") {
        store.setMessages([...store.messages, user]);
      } else if (type === "inline") {
        store.setMessagesInline([...store.messages_inline, user]);
      }
    }
  };
  const onKeyDown = async (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      if (e.shiftKey) {
        const pos = inputRef.current?.selectionStart || 0;
        setPrompt((pre) => `${pre.slice(0, pos)}\n${pre.slice(pos)}`);
        setTimeout(() => {
          inputRef.current!.setSelectionRange(pos + 1, pos + 1);
        }, 0);
      } else {
        await sendMessage();
      }
    }
  };

  const handleFileChange = async (
    e: ChangeEvent<HTMLInputElement>,
    type: object_string_type
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (type == "file") setFiles([...files, { file, name: file.name }]);
    else if (type == "image") setImages([...images, { file, name: file.name }]);
    else toast.error("Unsupported file type");
  };

  const removeFile = (index: number, type: object_string_type) => {
    if (type == "file") {
      const clone_file = cloneDeep(files);
      clone_file.splice(index, 1);
      setFiles(clone_file);
    } else if (type == "image") {
      const clone_img = cloneDeep(images);
      clone_img.splice(index, 1);
      setImages(clone_img);
    }
  };
  return (
    <div className={cn("w-full bg-background")}>
      <div className="max-w-screen-md mx-auto bg-secondary p-2 rounded-2xl group">
        {images.length > 0 && (
          <div className="flex flex-wrap m-3 gap-3">
            {images.map((item, index) => (
              <ImageCard
                key={index}
                file={item}
                removeFile={() => removeFile(index, "image")}
                updateFile={(file) => {
                  const clone_img = cloneDeep(images);
                  clone_img[index] = file;
                  setImages(clone_img);
                }}
              />
            ))}
          </div>
        )}
        {files.length > 0 && (
          <div className="flex flex-wrap my-3 gap-3">
            {files.map((item, index) => (
              <FileCard
                key={index}
                file={item}
                removeFile={() => removeFile(index, "file")}
                updateFile={(file) => {
                  const clone_file = cloneDeep(files);
                  clone_file[index] = file;
                  setFiles(clone_file);
                }}
              />
            ))}
          </div>
        )}
        <div className="flex items-center gap-2">
          <div className="p-1 rounded-xl bg-secondary flex items-center gap-4 flex-1">
            <div className="flex items-center justify-center gap-3">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger aria-label="Select file">
                    <label>
                      <PaperclipIcon width={22} className="cursor-pointer" />
                      <input
                        type="file"
                        accept={allowFileList.join(",")}
                        style={{ display: "none" }}
                        onChange={(e) => handleFileChange(e, "file")}
                        onClick={(event) => {
                          (event.target as HTMLInputElement).value = "";
                        }}
                      />
                    </label>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>支持的文件格式：{allowFileList.join(",")}</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger aria-label="Select image">
                    <label>
                      <PhotoIcon width={24} className="cursor-pointer" />
                      <input
                        type="file"
                        accept={allowImageList.join(",")}
                        style={{ display: "none" }}
                        onChange={(e) => handleFileChange(e, "image")}
                        onClick={(event) => {
                          (event.target as HTMLInputElement).value = "";
                        }}
                      />
                    </label>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>支持的图片格式：{allowImageList.join(",")}</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            <TextareaAutosize
              ref={inputRef}
              value={prompt}
              className={cn(
                "resize-none hover:resize overflow-x-hidden overflow-y-auto w-full outline-none text-sm bg-transparent leading-6 text-primary-text scrollbar-thin placeholder:text-gray-400"
              )}
              style={{ height: 24 }}
              onChange={(e) => setPrompt(e.target.value)}
              onKeyDown={onKeyDown}
              minRows={1}
              maxRows={5}
              autoComplete="off"
              placeholder="发送消息，按 Shift+Enter 换行"
            />
          </div>
          {isLoading ? (
            getStorageSetting()?.stream ? (
              <Button aria-label="取消回复" onClick={abortChat}>
                <StopCircleIcon />
              </Button>
            ) : (
              <Button disabled aria-label="正在回复">
                正在回复...
              </Button>
            )
          ) : (
            <Button
              disabled={!prompt.trim()}
              aria-label="发送"
              onClick={() => sendMessage()}
            >
              <SendIcon />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
