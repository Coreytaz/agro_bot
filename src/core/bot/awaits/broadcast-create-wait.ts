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
  let sourceType = "text";

  if (!title || !message) {
    await ctx.reply("Сессия устарела, попробуйте ещё раз");
    await ctx.sessionClear?.();
    return;
  }

  const media: any[] = [];

  if (ctx.message?.photo && ctx.message.photo.length > 0) {
    const photo = ctx.message.photo.at(-1);
    sourceType = "photo";
    media.push({
      type: "photo",
      url: photo?.file_id,
      fileId: photo?.file_id,
      fileSize: photo?.file_size,
    });
  } else if (ctx.message?.video) {
    sourceType = "video";
    media.push({
      type: "video",
      url: ctx.message.video.file_id,
      fileId: ctx.message.video.file_id,
      fileName: ctx.message.video.file_name,
      mimeType: ctx.message.video.mime_type,
      fileSize: ctx.message.video.file_size,
    });
  } else if (ctx.message?.document) {
    sourceType = "document";
    media.push({
      type: "document",
      url: ctx.message.document.file_id,
      fileId: ctx.message.document.file_id,
      fileName: ctx.message.document.file_name,
      mimeType: ctx.message.document.mime_type,
      fileSize: ctx.message.document.file_size,
    });
  } else if (ctx.message?.audio) {
    sourceType = "audio";
    media.push({
      type: "audio",
      url: ctx.message.audio.file_id,
      fileId: ctx.message.audio.file_id,
      fileName: ctx.message.audio.file_name,
      mimeType: ctx.message.audio.mime_type,
      fileSize: ctx.message.audio.file_size,
    });
  } else if (ctx.message?.voice) {
    sourceType = "voice";
    media.push({
      type: "voice",
      url: ctx.message.voice.file_id,
      fileId: ctx.message.voice.file_id,
      mimeType: ctx.message.voice.mime_type,
      fileSize: ctx.message.voice.file_size,
    });
  } else if (ctx.message?.video_note) {
    sourceType = "video_note";
    media.push({
      type: "video_note",
      url: ctx.message.video_note.file_id,
      fileId: ctx.message.video_note.file_id,
      fileSize: ctx.message.video_note.file_size,
    });
  } else if (ctx.message?.animation) {
    sourceType = "animation";
    media.push({
      type: "animation",
      url: ctx.message.animation.file_id,
      fileId: ctx.message.animation.file_id,
      fileName: ctx.message.animation.file_name,
      mimeType: ctx.message.animation.mime_type,
      fileSize: ctx.message.animation.file_size,
    });
  }

  await showBroadcastPreview(
    ctx,
    title,
    message,
    sourceType,
    media.length > 0 ? media : undefined,
  );
};

const showBroadcastPreview = async (
  ctx: Context,
  title: string,
  message: string,
  sourceType: string,
  media?: any[],
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
    data: { title, message, media },
  });

  const previewText = `\n📝 *${title}*\n${translations[LOCALIZATION_KEYS.BROADCAST_CREATE_PREVIEW]}\n\n${message}`;

  const firstMedia = media ? media[0] : null;

  switch (sourceType) {
    case "photo":
      await ctx.editAndReply.replyWithPhoto(firstMedia.url, {
        caption: previewText,
        parse_mode: "Markdown",
        reply_markup: keyboard,
      });
      break;
    case "video":
      await ctx.editAndReply.replyWithVideo(firstMedia.url, {
        caption: previewText,
        parse_mode: "Markdown",
        reply_markup: keyboard,
      });
      break;
    case "document":
      await ctx.editAndReply.replyWithDocument(firstMedia.url, {
        caption: previewText,
        parse_mode: "Markdown",
        reply_markup: keyboard,
      });
      break;
    case "audio":
      await ctx.editAndReply.replyWithAudio(firstMedia.url, {
        caption: previewText,
        parse_mode: "Markdown",
        reply_markup: keyboard,
      });
      break;
    case "voice":
      await ctx.editAndReply.replyWithVoice(firstMedia.url, {
        caption: previewText,
        parse_mode: "Markdown",
        reply_markup: keyboard,
      });
      break;
    case "animation":
      await ctx.editAndReply.replyWithAnimation(firstMedia.url, {
        caption: previewText,
        parse_mode: "Markdown",
        reply_markup: keyboard,
      });
      break;
    default:
      await ctx.editAndReply.reply(previewText, {
        parse_mode: "Markdown",
        reply_markup: keyboard,
      });
  }
};

export const broadcastConfirmCreate = async (ctx: Context) => {
  const sessionData = ctx.session?.data as any;
  const { title, message, media } = sessionData ?? {};

  if (!title || !message) {
    await ctx.answerCallbackQuery("Ошибка: данные рассылки не найдены");
    await ctx.sessionClear?.();
    return;
  }

  try {
    await createBroadcast({
      title,
      message,
      media,
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

    await ctx.editAndReply.reply(titleMsg, {
      parse_mode: "Markdown",
      reply_markup: keyboard,
    });
  } catch {
    await ctx.answerCallbackQuery("Ошибка при создании рассылки");
    await ctx.sessionClear?.();
  }
};

export const broadcastCancelCreate = async (ctx: Context) => {
  await ctx.sessionClear?.();
  await ctx.answerCallbackQuery("Создание рассылки отменено");

  const [titleMsg, keyboard] = await createBroadcastMenuKeyboard(ctx);

  await ctx.editAndReply.universalReply({
    type: "text",
    content: titleMsg,
    options: {
      reply_markup: keyboard,
    },
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

  await showBroadcastPreview(ctx, title, message, "text" /* no media */);
};

export default {
  broadcast_create_title: broadcastCreateTitleWait,
  broadcast_create_message: broadcastCreateMessageWait,
  broadcast_create_image: broadcastCreateImageWait,
};
