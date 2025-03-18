import { MessageInter } from "~/types";
import FileCard from "~/components/chat/FileCard";

interface UserMessageProps {
  message: MessageInter;
}

export function UserMessage({ message }: UserMessageProps) {
  return (
    <div className="flex items-start space-x-4 flex-row-reverse">
      <div className="w-9 h-9 rounded-full bg-secondary/10 flex items-center justify-center shrink-0">
        <span className="text-secondary text-sm font-medium">You</span>
      </div>
      <div className="flex-1 space-y-3">
        {message.images?.map((img, idx) => (
          <img
            key={idx}
            src={img.base64}
            alt={img.name}
            className="w-32 h-32 object-cover rounded-xl border border-border/50"
          />
        ))}
        {message.files?.map((file, idx) => (
          <FileCard key={idx} file={file} />
        ))}
        <div className="bg-primary text-primary-foreground rounded-2xl p-4 max-w-[80%] ml-auto">
          <pre className="whitespace-pre-wrap break-words text-sm">
            {message.text}
          </pre>
        </div>
      </div>
    </div>
  );
}
