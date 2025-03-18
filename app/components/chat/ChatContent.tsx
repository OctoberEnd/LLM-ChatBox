import { useChatStore } from "~/store";
import { useEffect, useRef, useState } from "react";
import { ChatContentType, MessageInter } from "~/types";
import Markdown from "~/components/markdown";
import FileCard from "~/components/chat/FileCard";
import { CheckIcon, ClipboardDocumentIcon } from "@heroicons/react/24/outline";
import pkg from "react-copy-to-clipboard";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "~/components/ui/tooltip";
import { cn } from "~/lib/utils";
import { MdSkeleton, SuggestionSkeleton } from "~/components/chat/ChatSkeleton";
const { CopyToClipboard } = pkg;

export default function ChatContent({ type }: ChatContentType) {
  const store = useChatStore();
  const [messages, setMessages] = useState<MessageInter[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);
  const timer = useRef<NodeJS.Timeout | null>(null);
  const [copied, setCopied] = useState(false);
  useEffect(() => {
    if (type === "inline") {
      setMessages(store.messages_inline);
    } else {
      setMessages(store.messages);
    }
  }, [store, type]);

  useEffect(() => {
    const distance =
      window.innerHeight - (scrollRef.current?.scrollHeight || 0) - 100;
    if (timer.current || distance > 0) return;
    timer.current = setTimeout(() => {
      ScrollToBottom();
      clearTimeout(timer.current as NodeJS.Timeout);
      timer.current = null;
    }, 800);
  }, [messages]);

  const ScrollToBottom = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({
        top: scrollRef.current.scrollHeight,
        behavior: "smooth",
      });
    }
  };
  useEffect(() => {
    if (copied) {
      setTimeout(() => setCopied(false), 1000);
    }
  }, [copied]);

  const sendMessage = (v: string) => {
    if (type === "inline") {
      store.setSendMessageFlagInline(v);
    } else {
      store.setSendMessageFlag(v);
    }
  };
  return (
    <div
      ref={scrollRef}
      className={cn(
        "flex-1 overflow-y-auto px-6 py-4",
        "scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600",
        type === "inline" && "h-[400px]"
      )}
    >
      {messages.map((item, index) => (
        <div className="mb-6" key={index}>
          {item.role === "assistant" && (
            <div className="flex items-start space-x-4">
              <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                <span className="text-primary text-sm font-medium">AI</span>
              </div>

              <div className="flex-1 space-y-2">
                {!item.error ? (
                  item.text ? (
                    <div className="group">
                      <div className="bg-muted/50 rounded-2xl p-4">
                        <Markdown>{item.text}</Markdown>
                      </div>
                      <div className="mt-1 hidden group-hover:flex justify-end">
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <CopyToClipboard
                                text={item.text}
                                onCopy={() => setCopied(true)}
                              >
                                <button className="p-1.5 rounded-md hover:bg-muted transition-colors">
                                  {copied ? (
                                    <CheckIcon className="w-4 h-4 text-green-500" />
                                  ) : (
                                    <ClipboardDocumentIcon className="w-4 h-4 text-muted-foreground" />
                                  )}
                                </button>
                              </CopyToClipboard>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>复制内容</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </div>
                    </div>
                  ) : (
                    <MdSkeleton />
                  )
                ) : (
                  <div className="text-red-500 bg-red-50 dark:bg-red-900/10 rounded-xl p-4">
                    {item.error}
                  </div>
                )}

                {index === messages.length - 1 && item.suggestions && (
                  <div className="mt-3 space-y-2">
                    {item.suggestions.length > 0 ? (
                      item.suggestions.map((suggestion, idx) => (
                        <button
                          key={idx}
                          onClick={() => sendMessage(suggestion)}
                          className="w-full text-left p-2.5 rounded-lg text-sm text-muted-foreground hover:bg-muted/50 hover:text-foreground transition-colors"
                        >
                          {suggestion}
                        </button>
                      ))
                    ) : (
                      <SuggestionSkeleton />
                    )}
                  </div>
                )}
              </div>
            </div>
          )}

          {item.role === "user" && (
            <div className="flex items-start space-x-4 flex-row-reverse">
              <div className="w-9 h-9 rounded-full bg-secondary/10 flex items-center justify-center shrink-0">
                <span className="text-secondary text-sm font-medium">You</span>
              </div>

              <div className="flex-1 space-y-3">
                {item.images?.map((img, idx) => (
                  <img
                    key={idx}
                    src={img.base64}
                    alt={img.name}
                    className="w-32 h-32 object-cover rounded-xl border border-border/50"
                  />
                ))}

                {item.files?.map((file, idx) => (
                  <FileCard key={idx} file={file} />
                ))}

                <div className="bg-primary text-primary-foreground rounded-2xl p-4 max-w-[80%] ml-auto">
                  <pre className="whitespace-pre-wrap break-words text-sm">
                    {item.text}
                  </pre>
                </div>
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
