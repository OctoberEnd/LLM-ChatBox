import { Button } from "../ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";

export default function SPopover() {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className="text-sm px-3 py-1 h-auto hover:bg-muted"
        >
          机器人 ID
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 space-y-3 text-sm">
        <p className="break-words leading-relaxed">
          进入机器人的开发页面，开发页面 URL 中 bot 参数后的数字即为机器人 ID
        </p>
      </PopoverContent>
    </Popover>
  );
}
