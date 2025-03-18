import { MagnifyingGlassIcon } from "@heroicons/react/24/outline";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogTrigger,
} from "~/components/ui/dialog";
import ChatContent from "~/components/chat/ChatContent";
import ChatInput from "~/components/chat/ChatInput";

export default function ChatDialog() {
  return (
    <div className="my-4 flex justify-center">
      <div>
        <Dialog>
          <DialogTrigger asChild>
            <button className="flex items-center gap-3 px-4 py-3 rounded-xl bg-secondary/80 hover:bg-secondary transition-colors w-[280px] sm:w-[320px]">
              <MagnifyingGlassIcon className="w-5 h-5 text-muted-foreground" />
              <span className="text-muted-foreground">搜索或输入问题...</span>
            </button>
          </DialogTrigger>

          <DialogContent className="h-[600px] max-w-[800px] p-4 rounded-xl border-border shadow-lg">
            <DialogTitle className="hidden"></DialogTitle>
            <div className="flex flex-col h-full">
              <div className="flex-1 overflow-hidden">
                <ChatContent key="inline-content" type="inline" />
              </div>
              <div className="pt-4">
                <ChatInput key="inline-input" type="inline" />
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
