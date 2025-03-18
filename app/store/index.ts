import { create } from "zustand";
import { MessageInter } from "~/types";

// 使用 zustand 的一个状态管理存储
// 为聊天应用提供一个集中管理状态的机制，使得不同组件可以方便地共享和更新聊天状态

// ChatState 接口定义了存储的状态结构和更新状态的方法
interface ChatState {
  messages: MessageInter[];
  setMessages(messages: MessageInter[]): void;
  messages_inline: MessageInter[];
  setMessagesInline(messages: MessageInter[]): void;
  sendMessageFlag: string;
  setSendMessageFlag(sendMessageFlag: string): void;
  sendMessageFlagInline: string;
  setSendMessageFlagInline(sendMessageFlagInline: string): void;
}

// hook，定义了存储的初始状态和更新状态的方法
// set函数用于更新存储中的状态
export const useChatStore = create<ChatState>((set) => ({
  messages: [],
  setMessages: (messages: MessageInter[]) => set({ messages }),
  messages_inline: [],
  setMessagesInline: (messages_inline: MessageInter[]) =>
    set({ messages_inline }),
  sendMessageFlag: "",
  setSendMessageFlag: (sendMessageFlag: string) => set({ sendMessageFlag }),
  sendMessageFlagInline: "",
  setSendMessageFlagInline: (sendMessageFlagInline: string) =>
    set({ sendMessageFlagInline }),
}));
