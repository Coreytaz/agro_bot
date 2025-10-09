import { drizzle } from "@core/db";
import {
  type ContentType,
  createOneChatReply,
  getOneChatReply,
  updateOneChatReply,
} from "@core/db/models";
import { isEmpty } from "@core/utils/isEmpty";
import type { NextFunction } from "grammy";
import type { InputFile, Message } from "grammy/types";

import type { Context } from "../interface/Context";
import { ContextWithEditAndReply } from "../interface/ContextWithEditAndReply";
import { getMessageId } from "../utils";

export type UniversalReplyContent =
  | {
      type: "text";
      content: string;
      options?: Parameters<Context["reply"]>[1];
    }
  | {
      type: "photo";
      content: string | InputFile;
      options?: Parameters<Context["replyWithPhoto"]>[1];
    }
  | {
      type: "video";
      content: string | InputFile;
      options?: Parameters<Context["replyWithVideo"]>[1];
    }
  | {
      type: "document";
      content: string | InputFile;
      options?: Parameters<Context["replyWithDocument"]>[1];
    }
  | {
      type: "audio";
      content: string | InputFile;
      options?: Parameters<Context["replyWithAudio"]>[1];
    }
  | {
      type: "voice";
      content: string | InputFile;
      options?: Parameters<Context["replyWithVoice"]>[1];
    }
  | {
      type: "animation";
      content: string | InputFile;
      options?: Parameters<Context["replyWithAnimation"]>[1];
    }
  | {
      type: "mediaGroup";
      content: Parameters<Context["replyWithMediaGroup"]>[0];
      options?: Parameters<Context["replyWithMediaGroup"]>[1];
    };

export type AutoReplyContent =
  | string // текст
  | {
      content: string | InputFile;
      type?: ContentType;
      options?: any;
    };

const find = async (ctx: Context) => {
  const replyMsg = await getOneChatReply({
    chatId: String(ctx.chat?.id),
    messageId: getMessageId(ctx),
  });
  return replyMsg;
};

const create = async (
  ctx: Context,
  messageId: number,
  contentType: ContentType,
) => {
  return drizzle.transaction(async tx => {
    let reply = await getOneChatReply(
      {
        chatId: String(ctx.chat?.id),
        messageId,
      },
      { ctx: tx },
    );

    if (!isEmpty(reply)) {
      reply = await updateOneChatReply(
        {
          chatId: String(ctx.chat?.id),
          messageId: messageId,
          contentType,
        },
        {
          messageId: messageId,
        },
        { ctx: tx },
      );
      return reply;
    }

    reply = await createOneChatReply(
      {
        chatId: String(ctx.chat?.id),
        messageId: messageId,
        contentType,
      },
      { ctx: tx },
    );

    return reply;
  });
};

const editAndReplyContext = (
  ctx: Context,
): ContextWithEditAndReply["editAndReply"] => {
  return {
    reply: async (text, options) => {
      const replyMsg = await find(ctx);

      if (isEmpty(replyMsg)) {
        const message = await ctx.reply(text, options);
        await create(ctx, message.message_id, "text");
        return message;
      }

      const editedMessage = await ctx.api.editMessageText(
        Number(ctx.chat?.id),
        Number(replyMsg?.messageId),
        text,
        options as Parameters<typeof ctx.api.editMessageText>[3],
      );
      return editedMessage as Message.TextMessage;
    },
    editMessageReplyMarkup: async options => {
      const replyMsg = await find(ctx);

      if (isEmpty(replyMsg)) {
        const message = await ctx.reply("", options);
        await create(ctx, message.message_id, "text");
        return { ...message, edit_date: message.date };
      }

      const editedMessage = await ctx.api.editMessageReplyMarkup(
        Number(ctx.chat?.id),
        Number(replyMsg?.messageId),
        options,
      );
      return editedMessage;
    },
    sendMessage: async (text, options) => {
      const replyMsg = await find(ctx);

      if (isEmpty(replyMsg)) {
        const message = await ctx.api.sendMessage(
          Number(ctx.chat?.id),
          text,
          options,
        );
        await create(ctx, message.message_id, "text");
        return message;
      }

      const sentMessage = await ctx.api.sendMessage(
        Number(ctx.chat?.id),
        text,
        options,
      );
      return sentMessage;
    },
    replyWithPhoto: async (photo, options) => {
      const replyMsg = await find(ctx);

      if (!photo) {
        if (!isEmpty(replyMsg)) {
          try {
            await ctx.api.deleteMessage(
              Number(ctx.chat?.id),
              Number(replyMsg?.messageId),
            );
          } catch {}
        }

        const text =
          options && typeof options === "object" && "caption" in options
            ? ((options as { caption?: string }).caption ?? "")
            : "";

        const message = await ctx.reply(text, options);
        await create(ctx, message.message_id, "text");
        return message;
      }

      if (isEmpty(replyMsg)) {
        const message = await ctx.replyWithPhoto(photo, options);
        await create(ctx, message.message_id, "photo");
        return message;
      }

      try {
        const editedMessage = await ctx.api.editMessageMedia(
          Number(ctx.chat?.id),
          Number(replyMsg?.messageId),
          {
            type: "photo",
            media: photo,
            caption:
              options && typeof options === "object" && "caption" in options
                ? (options as { caption?: string }).caption
                : undefined,
          },
          options as Parameters<typeof ctx.api.editMessageMedia>[3],
        );
        if (typeof editedMessage === "boolean") {
          const message = await ctx.replyWithPhoto(photo, options);
          await create(ctx, message.message_id, "photo");
          return message;
        }
        return editedMessage as any;
      } catch {
        try {
          await ctx.api.deleteMessage(
            Number(ctx.chat?.id),
            Number(replyMsg?.messageId),
          );
        } catch {}

        const message = await ctx.replyWithPhoto(photo, options);
        await create(ctx, message.message_id, "photo");
        return message;
      }
    },
    universalReply: async (content: UniversalReplyContent) => {
      const replyMsg = await find(ctx);
      const chatId = Number(ctx.chat?.id);

      if (isEmpty(replyMsg)) {
        let message: Message;

        switch (content.type) {
          case "text":
            message = await ctx.reply(content.content, content.options);
            break;
          case "photo":
            message = await ctx.replyWithPhoto(
              content.content,
              content.options,
            );
            break;
          case "video":
            message = await ctx.replyWithVideo(
              content.content,
              content.options,
            );
            break;
          case "document":
            message = await ctx.replyWithDocument(
              content.content,
              content.options,
            );
            break;
          case "audio":
            message = await ctx.replyWithAudio(
              content.content,
              content.options,
            );
            break;
          case "voice":
            message = await ctx.replyWithVoice(
              content.content,
              content.options,
            );
            break;
          case "animation":
            message = await ctx.replyWithAnimation(
              content.content,
              content.options,
            );
            break;
          case "mediaGroup":
            const mediaMessages = await ctx.replyWithMediaGroup(
              content.content,
              content.options,
            );
            // Для mediaGroup используем первое сообщение для отслеживания
            message = mediaMessages[0];
            break;
          default:
            throw new Error(
              `Unsupported content type: ${(content as any).type}`,
            );
        }

        await create(ctx, message.message_id, content.type);
        return message;
      }

      const messageId = Number(replyMsg?.messageId);

      const type = replyMsg?.contentType ?? "text";

      if (
        content.type !== type ||
        content.type === "mediaGroup" ||
        type === "mediaGroup"
      ) {
        try {
          await ctx.api.deleteMessage(chatId, messageId);
        } catch {}

        let message: Message;

        switch (content.type) {
          case "text":
            message = await ctx.reply(content.content, content.options);
            break;
          case "photo":
            message = await ctx.replyWithPhoto(
              content.content,
              content.options,
            );
            break;
          case "video":
            message = await ctx.replyWithVideo(
              content.content,
              content.options,
            );
            break;
          case "document":
            message = await ctx.replyWithDocument(
              content.content,
              content.options,
            );
            break;
          case "audio":
            message = await ctx.replyWithAudio(
              content.content,
              content.options,
            );
            break;
          case "voice":
            message = await ctx.replyWithVoice(
              content.content,
              content.options,
            );
            break;
          case "animation":
            message = await ctx.replyWithAnimation(
              content.content,
              content.options,
            );
            break;
          case "mediaGroup":
            const mediaMessages = await ctx.replyWithMediaGroup(
              content.content,
              content.options,
            );
            message = mediaMessages[0];
            break;
          default:
            throw new Error(
              `Unsupported content type: ${(content as any).type}`,
            );
        }

        await create(ctx, message.message_id, content.type);
        return message;
      }

      try {
        if (type === "text") {
          const editedMessage = await ctx.api.editMessageText(
            chatId,
            messageId,
            content.content as string,
            content.options as Parameters<typeof ctx.api.editMessageText>[3],
          );
          return editedMessage as Message.TextMessage;
        } else {
          let mediaType: string;
          let caption: string | undefined;

          switch (type) {
            case "photo":
              mediaType = "photo";
              caption =
                content.options &&
                typeof content.options === "object" &&
                "caption" in content.options
                  ? (content.options as { caption?: string }).caption
                  : undefined;
              break;
            case "video":
              mediaType = "video";
              caption =
                content.options &&
                typeof content.options === "object" &&
                "caption" in content.options
                  ? (content.options as { caption?: string }).caption
                  : undefined;
              break;
            case "document":
              mediaType = "document";
              caption =
                content.options &&
                typeof content.options === "object" &&
                "caption" in content.options
                  ? (content.options as { caption?: string }).caption
                  : undefined;
              break;
            case "audio":
              mediaType = "audio";
              caption =
                content.options &&
                typeof content.options === "object" &&
                "caption" in content.options
                  ? (content.options as { caption?: string }).caption
                  : undefined;
              break;
            case "voice":
              mediaType = "voice";
              caption = undefined;
              break;
            case "animation":
              mediaType = "animation";
              caption =
                content.options &&
                typeof content.options === "object" &&
                "caption" in content.options
                  ? (content.options as { caption?: string }).caption
                  : undefined;
              break;
            default:
              throw new Error(
                `Unsupported media type: ${(content as any).type}`,
              );
          }

          const editedMessage = await ctx.api.editMessageMedia(
            chatId,
            messageId,
            {
              type: mediaType as any,
              media: content.content as any,
              caption,
            },
            content.options as Parameters<typeof ctx.api.editMessageMedia>[3],
          );

          if (typeof editedMessage === "boolean") {
            throw new Error("Edit returned boolean, fallback to new message");
          }

          return editedMessage as any;
        }
      } catch {
        await ctx.api.deleteMessage(chatId, messageId);

        let message: Message;

        // В catch блоке используем any для избежания проблем с типизацией
        const anyContent = content as any;

        switch (anyContent.type) {
          case "text":
            message = await ctx.reply(anyContent.content, anyContent.options);
            break;
          case "photo":
            message = await ctx.replyWithPhoto(
              anyContent.content,
              anyContent.options,
            );
            break;
          case "video":
            message = await ctx.replyWithVideo(
              anyContent.content,
              anyContent.options,
            );
            break;
          case "document":
            message = await ctx.replyWithDocument(
              anyContent.content,
              anyContent.options,
            );
            break;
          case "audio":
            message = await ctx.replyWithAudio(
              anyContent.content,
              anyContent.options,
            );
            break;
          case "voice":
            message = await ctx.replyWithVoice(
              anyContent.content,
              anyContent.options,
            );
            break;
          case "animation":
            message = await ctx.replyWithAnimation(
              anyContent.content,
              anyContent.options,
            );
            break;
          case "mediaGroup":
            const mediaMessages = await ctx.replyWithMediaGroup(
              anyContent.content,
              anyContent.options,
            );
            message = mediaMessages[0];
            break;
          default:
            throw new Error(`Unsupported content type: ${anyContent.type}`);
        }

        await create(ctx, message.message_id, content.type);
        return message;
      }
    },
    autoReply: async (content: string | InputFile, options?: any) => {
      const replyMsg = await find(ctx);

      if (replyMsg && !isEmpty(replyMsg) && replyMsg.contentType) {
        return editAndReplyContext(ctx).universalReply({
          type: replyMsg.contentType as any,
          content,
          options,
        });
      }

      return editAndReplyContext(ctx).universalReply({
        type: "text",
        content: typeof content === "string" ? content : "[File]",
        options,
      });
    },
    replyWithVideo: async (
      video: Parameters<Context["replyWithVideo"]>[0],
      options?: Parameters<Context["replyWithVideo"]>[1],
    ) => {
      return editAndReplyContext(ctx).universalReply({
        type: "video",
        content: video,
        options,
      });
    },
    replyWithDocument: async (
      document: Parameters<Context["replyWithDocument"]>[0],
      options?: Parameters<Context["replyWithDocument"]>[1],
    ) => {
      return editAndReplyContext(ctx).universalReply({
        type: "document",
        content: document,
        options,
      });
    },
    replyWithAudio: async (
      audio: Parameters<Context["replyWithAudio"]>[0],
      options?: Parameters<Context["replyWithAudio"]>[1],
    ) => {
      return editAndReplyContext(ctx).universalReply({
        type: "audio",
        content: audio,
        options,
      });
    },
    replyWithVoice: async (
      voice: Parameters<Context["replyWithVoice"]>[0],
      options?: Parameters<Context["replyWithVoice"]>[1],
    ) => {
      return editAndReplyContext(ctx).universalReply({
        type: "voice",
        content: voice,
        options,
      });
    },
    replyWithAnimation: async (
      animation: Parameters<Context["replyWithAnimation"]>[0],
      options?: Parameters<Context["replyWithAnimation"]>[1],
    ) => {
      return editAndReplyContext(ctx).universalReply({
        type: "animation",
        content: animation,
        options,
      });
    },
    replyWithMediaGroup: async (
      media: Parameters<Context["replyWithMediaGroup"]>[0],
      options?: Parameters<Context["replyWithMediaGroup"]>[1],
    ) => {
      return editAndReplyContext(ctx).universalReply({
        type: "mediaGroup",
        content: media,
        options,
      });
    },
  };
};

export default async function editAndReply(ctx: Context, next: NextFunction) {
  ctx.editAndReply = editAndReplyContext(ctx);
  await next();
}
