import {
  createOneChatReply,
  getOneChatReply,
  updateOneChatReply,
} from "@core/db/models";
import { isEmpty } from "@core/utils/isEmpty";
import type { NextFunction } from "grammy";
import type { Message } from "grammy/types";

import type { Context } from "../interface/Context";
import { ContextWithEditAndReply } from "../interface/ContextWithEditAndReply";
import { getMessageId } from "../utils";

const find = async (ctx: Context) => {
  const replyMsg = await getOneChatReply({
    chatId: String(ctx.chat?.id),
    messageId: getMessageId(ctx),
  });
  return replyMsg;
};

const create = async (ctx: Context, messageId: number) => {
  let reply = await getOneChatReply({
    chatId: String(ctx.chat?.id),
    messageId,
  });

  if (!isEmpty(reply)) {
    reply = await updateOneChatReply(
      {
        chatId: String(ctx.chat?.id),
        messageId: messageId,
      },
      {
        messageId: messageId,
      },
    );
    return reply;
  }

  reply = await createOneChatReply({
    chatId: String(ctx.chat?.id),
    messageId: messageId,
  });

  return reply;
};

const editAndReplyContext = (
  ctx: Context,
): ContextWithEditAndReply["editAndReply"] => {
  return {
    reply: async (text, options) => {
      const replyMsg = await find(ctx);

      if (isEmpty(replyMsg)) {
        const message = await ctx.reply(text, options);
        await create(ctx, message.message_id);
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
        await create(ctx, message.message_id);
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
        await create(ctx, message.message_id);
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
        await create(ctx, message.message_id);
        return message;
      }

      if (isEmpty(replyMsg)) {
        const message = await ctx.replyWithPhoto(photo, options);
        await create(ctx, message.message_id);
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
          await create(ctx, message.message_id);
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
        await create(ctx, message.message_id);
        return message;
      }
    },
  };
};

export default async function editAndReply(ctx: Context, next: NextFunction) {
  ctx.editAndReply = editAndReplyContext(ctx);
  await next();
}
