import { useChatStore } from "~/store";
import { useEffect, useRef, useState } from "react";
import { ChatContentType, MessageInter } from "~/types";
import { cn } from "~/lib/utils";
import { AIMessage } from "./AIMessage";
import { UserMessage } from "./UserMessage";

// 聊天内容组件
export default function ChatContent({ type }: ChatContentType) {
  // 聊天存储，获取消息数据
  const store = useChatStore();
  // 消息，管理本地的 messages 状态
  const [messages, setMessages] = useState<MessageInter[]>([]);
  // 滚动条
  const scrollRef = useRef<HTMLDivElement>(null);
  // 定时器
  const timer = useRef<NodeJS.Timeout | null>(null);
  // 复制状态
  const [copied, setCopied] = useState(false);
  // 使用聊天存储，从store获取消息数据
  useEffect(() => {
    if (type === "inline") {
      setMessages(store.messages_inline);
    } else {
      setMessages(store.messages);
    }
  }, [store, type]);
  // 滚动条
  useEffect(() => {
    // 计算滚动条距离底部的高度
    const distance =
      window.innerHeight - (scrollRef.current?.scrollHeight || 0) - 100;
    // 如果定时器存在或滚动条距离底部的高度大于0，则不执行
    if (timer.current || distance > 0) return;
    // 设置定时器，800ms后执行
    timer.current = setTimeout(() => {
      // 滚动到底部
      ScrollToBottom();
      // 清除定时器
      clearTimeout(timer.current as NodeJS.Timeout);
      // 定时器置空
      timer.current = null;
    }, 800);
  }, [messages]);

  //  messages 更新时自动滚动到底部
  const ScrollToBottom = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({
        top: scrollRef.current.scrollHeight,
        behavior: "smooth",
      });
    }
  };
  // 复制状态
  useEffect(() => {
    if (copied) {
      setTimeout(() => setCopied(false), 1000);
    }
  }, [copied]);
  // 发送消息
  const sendMessage = (v: string) => {
    if (type === "inline") {
      store.setSendMessageFlagInline(v);
    } else {
      store.setSendMessageFlag(v);
    }
  };
  // 返回聊天内容组件
  return (
    // 滚动条
    <div
      ref={scrollRef}
      className={cn(
        "flex-1 overflow-y-auto px-6 py-4",
        "scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600",
        type === "inline" && "h-[400px]"
      )}
    >
      {/* 遍历 messages 数组，渲染每条消息 */}
      {messages.map((item, index) => (
        <div className="mb-6" key={index}>
          {/* 根据消息的 role 属性决定显示样式 */}
          {item.role === "assistant" && (
            <AIMessage key={index} message={item} onSendMessage={sendMessage} />
          )}

          {/* 用户消息 */}
          {item.role === "user" && <UserMessage key={index} message={item} />}
        </div>
      ))}
    </div>
  );
}
