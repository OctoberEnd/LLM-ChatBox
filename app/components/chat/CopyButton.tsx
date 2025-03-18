import { useState, useEffect } from "react";
import { CheckIcon, ClipboardDocumentIcon } from "@heroicons/react/24/outline";
import pkg from "react-copy-to-clipboard";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "../ui/tooltip";

const { CopyToClipboard } = pkg;
interface CopyButtonProps {
  text: string;
}

export default function CopyButton({ text }: CopyButtonProps) {
  const [copied, setCopied] = useState(false);
  useEffect(() => {
    if (copied) {
      const timer = setTimeout(() => setCopied(false), 1000);
      return () => clearTimeout(timer);
    }
  }, [copied]);

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <CopyToClipboard text={text} onCopy={() => setCopied(true)}>
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
  );
}
