// components/Sidebar.tsx
import {
  PlusIcon,
  TrashIcon,
  ChatBubbleLeftIcon,
} from "@heroicons/react/24/outline";
import { Button } from "../ui/button";
import { ThemeToggle } from "../ui/ThemeToggle";
import { cn } from "~/lib/utils";

export default function Sidebar() {
  // 模拟的静态数据
  const mockSessions = [
    { id: "1", title: "关于React的讨论" },
    { id: "2", title: "TypeScript学习笔记" },
    { id: "3", title: "项目架构设计" },
  ];

  return (
    <div className="w-64 bg-card border-r border-border h-screen flex flex-col">
      {/* 顶部标题和新建按钮 */}
      <div className="p-4 border-b border-border flex items-center justify-between">
        <h2 className="text-lg font-semibold">会话列表</h2>
        <Button
          variant="ghost"
          size="icon"
          className="hover:bg-accent"
          aria-label="新建会话"
        >
          <PlusIcon className="h-5 w-5" />
        </Button>
      </div>

      {/* 会话列表 */}
      <div className="flex-1 overflow-y-auto p-2 space-y-1">
        {mockSessions.map((session) => (
          <div
            key={session.id}
            className={cn(
              "group flex items-center gap-2 p-2 rounded-lg transition-colors",
              session.id === "1"
                ? "bg-accent text-accent-foreground"
                : "hover:bg-accent/50"
            )}
          >
            {/* 会话图标和标题 */}
            <ChatBubbleLeftIcon className="h-5 w-5 flex-shrink-0" />
            <button className="flex-1 text-left truncate text-sm" tabIndex={0}>
              {session.title}
            </button>

            {/* 删除按钮 */}
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity"
              aria-label="删除会话"
            >
              <TrashIcon className="h-4 w-4 text-muted-foreground hover:text-destructive" />
            </Button>
          </div>
        ))}
      </div>

      {/* 底部功能区 */}
      <div className="p-4 border-t border-border space-y-2">
        {/* 导出按钮 */}
        <div className="flex items-center gap-2">
          <p className="text-sm text-muted-foreground">切换主题</p>
          <ThemeToggle />
        </div>
        <Button variant="outline" className="w-full text-sm" size="sm">
          导出会话记录
        </Button>

        {/* 导入按钮 */}
        <Button variant="outline" className="w-full text-sm" size="sm">
          导入会话记录
        </Button>
      </div>
    </div>
  );
}
