import { LOCALIZATION_KEYS } from "@config/localization.config";
import { InlineKeyboard } from "grammy";

import { createBroadcast } from "../../db/models";
import type { Context } from "../core/interface/Context";
import { createBroadcastMenuKeyboard } from "../utils";

export const broadcastCreateTitleWait = async (ctx: Context) => {
  const title = ctx.message?.text?.trim();
  if (!title) {
    const translations = await ctx.tm([
      LOCALIZATION_KEYS.BROADCAST_CREATE_ENTER_TITLE,
    ]);
    await ctx.reply(
      translations[LOCALIZATION_KEYS.BROADCAST_CREATE_ENTER_TITLE],
    );
    return;
  }

  await ctx.sessionSet?.({
    route: "broadcast_create_message",
    data: { title, step: "waiting_message" },
  });

  const translations = await ctx.tm([
    LOCALIZATION_KEYS.BROADCAST_CREATE_ENTER_MESSAGE,
  ]);
  await ctx.reply(
    translations[LOCALIZATION_KEYS.BROADCAST_CREATE_ENTER_MESSAGE],
  );
};

export const broadcastCreateMessageWait = async (ctx: Context) => {
  const message = ctx.message?.text?.trim();
  if (!message) {
    const translations = await ctx.tm([
      LOCALIZATION_KEYS.BROADCAST_CREATE_ENTER_MESSAGE,
    ]);
    await ctx.reply(
      translations[LOCALIZATION_KEYS.BROADCAST_CREATE_ENTER_MESSAGE],
    );
    return;
  }

  const sessionData = ctx.session?.data as any;
  const title = sessionData?.title;

  if (!title) {
    await ctx.reply("Сессия устарела, попробуйте ещё раз");
    await ctx.sessionClear?.();
    return;
  }

  await ctx.sessionSet?.({
    route: "broadcast_create_image",
    data: { title, message, step: "waiting_image" },
  });

  const translations = await ctx.tm([
    LOCALIZATION_KEYS.BROADCAST_CREATE_ENTER_IMAGE,
    LOCALIZATION_KEYS.COMMON_SKIP,
  ]);

  const keyboard = new InlineKeyboard().text(
    translations[LOCALIZATION_KEYS.COMMON_SKIP],
    "broadcast_skip_image",
  );

  await ctx.editAndReply.reply(
    translations[LOCALIZATION_KEYS.BROADCAST_CREATE_ENTER_IMAGE],
    { reply_markup: keyboard },
  );
};

export const broadcastCreateImageWait = async (ctx: Context) => {
  const sessionData = ctx.session?.data as any;
  const title = sessionData?.title;
  const message = sessionData?.message;

  if (!title || !message) {
    await ctx.reply("Сессия устарела, попробуйте ещё раз");
    await ctx.sessionClear?.();
    return;
  }

  let imageUrl: string | undefined;

  // Проверяем, есть ли фото в сообщении
  if (ctx.message?.photo && ctx.message.photo.length > 0) {
    // Берем самое большое фото
    const photo = ctx.message.photo[ctx.message.photo.length - 1];
    imageUrl = photo.file_id;
  }

  await showBroadcastPreview(ctx, title, message, imageUrl);
};

const showBroadcastPreview = async (
  ctx: Context,
  title: string,
  message: string,
  imageUrl?: string,
) => {
  if (ctx.callbackQuery) {
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    await ctx?.answerCallbackQuery?.();
  }

  const translations = await ctx.tm([
    LOCALIZATION_KEYS.BROADCAST_CREATE_PREVIEW,
    LOCALIZATION_KEYS.COMMON_CONFIRM,
    LOCALIZATION_KEYS.COMMON_CANCEL,
  ]);

  const sendNowTranslations = await ctx.tm([
    LOCALIZATION_KEYS.BROADCAST_SEND_NOW,
    LOCALIZATION_KEYS.BROADCAST_SCHEDULE,
  ]);

  const keyboard = new InlineKeyboard()
    .text(
      sendNowTranslations[LOCALIZATION_KEYS.BROADCAST_SEND_NOW],
      "broadcast_send_now",
    )
    .text(
      sendNowTranslations[LOCALIZATION_KEYS.BROADCAST_SCHEDULE],
      "broadcast_schedule_select",
    )
    .row()
    .text(
      translations[LOCALIZATION_KEYS.COMMON_CANCEL],
      "broadcast_cancel_create",
    );

  await ctx.sessionSet?.({
    route: "broadcast_confirm",
    data: { title, message, imageUrl },
  });

  const previewText = `\n📝 *${title}*\n${translations[LOCALIZATION_KEYS.BROADCAST_CREATE_PREVIEW]}\n\n${message}`;

  if (imageUrl) {
    await ctx.editAndReply.replyWithPhoto(imageUrl, {
      caption: previewText,
      parse_mode: "Markdown",
      reply_markup: keyboard,
    });
  } else {
    await ctx.editAndReply.reply(previewText, {
      parse_mode: "Markdown",
      reply_markup: keyboard,
    });
  }
};

export const broadcastConfirmCreate = async (ctx: Context) => {
  const sessionData = ctx.session?.data as any;
  const { title, message, imageUrl } = sessionData ?? {};

  if (!title || !message) {
    await ctx.answerCallbackQuery("Ошибка: данные рассылки не найдены");
    await ctx.sessionClear?.();
    return;
  }

  try {
    await createBroadcast({
      title,
      message,
      imageUrl,
      createdBy: ctx.chatDB.chatId,
    });

    const translations = await ctx.tm([
      LOCALIZATION_KEYS.BROADCAST_CREATE_SUCCESS,
    ]);

    await ctx.sessionClear?.();
    await ctx.answerCallbackQuery(
      translations[LOCALIZATION_KEYS.BROADCAST_CREATE_SUCCESS],
    );

    const [titleMsg, keyboard] = await createBroadcastMenuKeyboard(ctx);

    if (imageUrl) {
      await ctx.editAndReply.replyWithPhoto(undefined, {
        caption: titleMsg,
        parse_mode: "Markdown",
        reply_markup: keyboard,
      });
    } else {
      await ctx.editAndReply.reply(titleMsg, {
        parse_mode: "Markdown",
        reply_markup: keyboard,
      });
    }
  } catch {
    await ctx.answerCallbackQuery("Ошибка при создании рассылки");
    await ctx.sessionClear?.();
  }
};

export const broadcastCancelCreate = async (ctx: Context) => {
  await ctx.sessionClear?.();
  await ctx.answerCallbackQuery("Создание рассылки отменено");

  const [titleMsg, keyboard] = await createBroadcastMenuKeyboard(ctx);

  await ctx.editMessageText(titleMsg, {
    reply_markup: keyboard,
  });
};

export const broadcastSkipImage = async (ctx: Context) => {
  const sessionData = ctx.session?.data as any;
  const title = sessionData?.title;
  const message = sessionData?.message;

  if (!title || !message) {
    await ctx.answerCallbackQuery("Ошибка при создании рассылки");
    await ctx.sessionClear?.();
    return;
  }

  await showBroadcastPreview(ctx, title, message);
};

export default {
  broadcast_create_title: broadcastCreateTitleWait,
  broadcast_create_message: broadcastCreateMessageWait,
  broadcast_create_image: broadcastCreateImageWait,
};
