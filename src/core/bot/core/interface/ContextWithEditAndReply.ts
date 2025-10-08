import type { Context } from "./Context";

export interface ContextWithEditAndReply {
  editAndReply: {
    reply: Context["reply"];
    replyWithPhoto: (
      photo?: Parameters<Context["replyWithPhoto"]>[0],
      other?: Parameters<Context["replyWithPhoto"]>[1]
    ) => ReturnType<Context["replyWithPhoto"]>;
    editMessageReplyMarkup: Context["editMessageReplyMarkup"];
    sendMessage: (
      text: Parameters<Context["api"]["sendMessage"]>[1],
      other: Parameters<Context["api"]["sendMessage"]>[2],
    ) => ReturnType<Context["api"]["sendMessage"]>;
  };
}
