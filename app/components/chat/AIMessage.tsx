import { MessageInter } from "../../types";
import Markdown from "../markdown";
import CopyButton from "./CopyButton";
import { MdSkeleton } from "./ChatSkeleton";

interface AIMessageProps {
  message: MessageInter;
  onSendMessage: (text: string) => void;
}

export function AIMessage({ message, onSendMessage }: AIMessageProps) {
  return (
    <div className="flex items-start space-x-4">
      <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
        <span className="text-primary text-sm font-medium">AI</span>
      </div>
      <div className="flex-1 space-y-2">
        {!message.error ? (
          message.text ? (
            <div className="group">
              <div className="bg-muted/50 rounded-2xl p-4">
                <Markdown>{message.text}</Markdown>
              </div>
              <CopyButton text={message.text} />
            </div>
          ) : (
            <MdSkeleton />
          )
        ) : (
          <div className="text-red-500 bg-red-50 dark:bg-red-900/10 rounded-xl p-4">
            {message.error}
          </div>
        )}
        {message.suggestions && (
          <div className="mt-3 space-y-2">
            {message.suggestions.map((suggestion, idx) => (
              <button
                key={idx}
                onClick={() => onSendMessage(suggestion)}
                className="w-full text-left p-2.5 rounded-lg text-sm text-muted-foreground hover:bg-muted/50 hover:text-foreground transition-colors"
              >
                {suggestion}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
