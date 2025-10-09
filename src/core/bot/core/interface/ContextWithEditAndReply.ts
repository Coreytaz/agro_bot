import type { InputFile } from "grammy/types";

import type { UniversalReplyContent } from "../middlewares/editAndReply.middleware";
import type { Context } from "./Context";

export interface ContextWithEditAndReply {
  editAndReply: {
    reply: Context["reply"];
    replyWithPhoto: (
      photo?: Parameters<Context["replyWithPhoto"]>[0],
      other?: Parameters<Context["replyWithPhoto"]>[1],
    ) => ReturnType<Context["replyWithPhoto"]>;
    editMessageReplyMarkup: Context["editMessageReplyMarkup"];
    sendMessage: (
      text: Parameters<Context["api"]["sendMessage"]>[1],
      other: Parameters<Context["api"]["sendMessage"]>[2],
    ) => ReturnType<Context["api"]["sendMessage"]>;
    universalReply: (content: UniversalReplyContent) => Promise<any>;
    autoReply: (content: string | InputFile, options?: any) => Promise<any>;
    replyWithVideo: (
      video: Parameters<Context["replyWithVideo"]>[0],
      other?: Parameters<Context["replyWithVideo"]>[1],
    ) => Promise<any>;
    replyWithDocument: (
      document: Parameters<Context["replyWithDocument"]>[0],
      other?: Parameters<Context["replyWithDocument"]>[1],
    ) => Promise<any>;
    replyWithAudio: (
      audio: Parameters<Context["replyWithAudio"]>[0],
      other?: Parameters<Context["replyWithAudio"]>[1],
    ) => Promise<any>;
    replyWithVoice: (
      voice: Parameters<Context["replyWithVoice"]>[0],
      other?: Parameters<Context["replyWithVoice"]>[1],
    ) => Promise<any>;
    replyWithAnimation: (
      animation: Parameters<Context["replyWithAnimation"]>[0],
      other?: Parameters<Context["replyWithAnimation"]>[1],
    ) => Promise<any>;
    replyWithMediaGroup: (
      media: Parameters<Context["replyWithMediaGroup"]>[0],
      other?: Parameters<Context["replyWithMediaGroup"]>[1],
    ) => Promise<any>;
  };
}
