import { LOCALIZATION_KEYS } from "@config/localization.config";
import { createBroadcast } from "@core/db/models";
import { sendBroadcastNow } from "@core/db/utils/broadcastScheduler";

import {
  broadcastCancelCreate,
  broadcastConfirmCreate,
  broadcastSkipImage,
} from "../awaits/broadcast-create-wait";
import type { Context } from "../core/interface/Context";
import { createBroadcastMenuKeyboard } from "../utils";

const broadcastMenuHandler = async (ctx: Context): Promise<void> => {
  const [title, keyboard] = await createBroadcastMenuKeyboard(ctx);

  await ctx.editMessageText(title, {
    reply_markup: keyboard,
  });
};

const broadcastCreateHandler = async (ctx: Context): Promise<void> => {
  const translations = await ctx.tm([
    LOCALIZATION_KEYS.BROADCAST_CREATE_TITLE,
    LOCALIZATION_KEYS.BROADCAST_CREATE_ENTER_TITLE,
  ]);

  await ctx.editMessageText(
    `${translations[LOCALIZATION_KEYS.BROADCAST_CREATE_TITLE]}\n\n${translations[LOCALIZATION_KEYS.BROADCAST_CREATE_ENTER_TITLE]}`,
    {
      reply_markup: undefined,
    },
  );

  if (ctx.sessionSet) {
    await ctx.sessionSet({
      route: "broadcast_create_title",
      data: { step: "waiting_title" },
    });
  }
};

const broadcastSendNowHandler = async (ctx: Context): Promise<void> => {
  const sessionData = ctx.session?.data as any;
  const { title, message, imageUrl } = sessionData ?? {};

  if (!title || !message) {
    await ctx.answerCallbackQuery("Ошибка: данные рассылки не найдены");
    await ctx.sessionClear?.();
    return;
  }

  try {
    const broadcast = await createBroadcast({
      title,
      message,
      imageUrl,
      createdBy: ctx.chatDB.chatId,
    });

    await sendBroadcastNow(broadcast.id);

    const translations = await ctx.tm([
      LOCALIZATION_KEYS.BROADCAST_SEND_SUCCESS,
    ]);

    await ctx.sessionClear?.();
    await ctx.answerCallbackQuery(
      translations[LOCALIZATION_KEYS.BROADCAST_SEND_SUCCESS],
    );

    const [titleMsg, keyboard] = await createBroadcastMenuKeyboard(ctx);
    await ctx.editMessageText(titleMsg, {
      reply_markup: keyboard,
    });
  } catch {
    const translations = await ctx.tm([LOCALIZATION_KEYS.BROADCAST_SEND_ERROR]);
    await ctx.answerCallbackQuery(
      translations[LOCALIZATION_KEYS.BROADCAST_SEND_ERROR],
    );
    await ctx.sessionClear?.();
  }
};

const broadcastListHandler = async (ctx: Context): Promise<void> => {
  await ctx.answerCallbackQuery("Функция в разработке");
};

const broadcastDraftsHandler = async (ctx: Context): Promise<void> => {
  await ctx.answerCallbackQuery("Функция в разработке");
};

const broadcastHistoryHandler = async (ctx: Context): Promise<void> => {
  await ctx.answerCallbackQuery("Функция в разработке");
};

export default {
  broadcast_menu: broadcastMenuHandler,
  broadcast_create: broadcastCreateHandler,
  broadcast_send_now: broadcastSendNowHandler,
  broadcast_list: broadcastListHandler,
  broadcast_drafts: broadcastDraftsHandler,
  broadcast_history: broadcastHistoryHandler,
  broadcast_confirm_create: broadcastConfirmCreate,
  broadcast_cancel_create: broadcastCancelCreate,
  broadcast_skip_image: broadcastSkipImage,
};
