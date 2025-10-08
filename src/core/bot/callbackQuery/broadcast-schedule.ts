import { LOCALIZATION_KEYS } from "@config/localization.config";
import { BroadcastCronManager } from "@core/cron";
import { createBroadcast } from "@core/db/models";
import { InlineKeyboard } from "grammy";

import {
  COMMON_CRON_EXPRESSIONS,
  scheduleBroadcast,
  sendBroadcastNow,
} from "../../db/utils/broadcastScheduler";
import type { Context } from "../core/interface/Context";
import { createBroadcastMenuKeyboard } from "../utils";

const broadcastScheduleSelectHandler = async (ctx: Context): Promise<void> => {
  const translations = await ctx.tm([
    LOCALIZATION_KEYS.BROADCAST_SCHEDULE_SELECT,
    LOCALIZATION_KEYS.BROADCAST_SCHEDULE_NOW,
    LOCALIZATION_KEYS.BROADCAST_SCHEDULE_DAILY,
    LOCALIZATION_KEYS.BROADCAST_SCHEDULE_WEEKLY,
    LOCALIZATION_KEYS.BROADCAST_SCHEDULE_CUSTOM,
    LOCALIZATION_KEYS.COMMON_CANCEL,
  ]);

  const keyboard = new InlineKeyboard()
    .text(
      translations[LOCALIZATION_KEYS.BROADCAST_SCHEDULE_NOW],
      "broadcast_schedule_now",
    )
    .row()
    .text(
      translations[LOCALIZATION_KEYS.BROADCAST_SCHEDULE_DAILY],
      "broadcast_schedule_daily",
    )
    .row()
    .text(
      translations[LOCALIZATION_KEYS.BROADCAST_SCHEDULE_WEEKLY],
      "broadcast_schedule_weekly",
    )
    .row()
    .text(
      translations[LOCALIZATION_KEYS.BROADCAST_SCHEDULE_CUSTOM],
      "broadcast_schedule_custom",
    )
    .row()
    .text(
      translations[LOCALIZATION_KEYS.COMMON_CANCEL],
      "broadcast_cancel_create",
    );

  await ctx.editMessageText(
    translations[LOCALIZATION_KEYS.BROADCAST_SCHEDULE_SELECT],
    {
      reply_markup: keyboard,
    },
  );
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
      LOCALIZATION_KEYS.BROADCAST_SCHEDULE_SUCCESS,
    ]);

    await ctx.sessionClear?.();
    await ctx.answerCallbackQuery(
      translations[LOCALIZATION_KEYS.BROADCAST_SCHEDULE_SUCCESS],
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

const broadcastScheduleDailyHandler = async (ctx: Context): Promise<void> => {
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

    await scheduleBroadcast(
      broadcast.id,
      COMMON_CRON_EXPRESSIONS.DAILY_9AM,
      true,
    );

    const translations = await ctx.tm([
      LOCALIZATION_KEYS.BROADCAST_SCHEDULE_SUCCESS,
    ]);
    await ctx.sessionClear?.();
    await ctx.answerCallbackQuery(
      translations[LOCALIZATION_KEYS.BROADCAST_SCHEDULE_SUCCESS],
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

const broadcastScheduleWeeklyHandler = async (ctx: Context): Promise<void> => {
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

    // Планируем еженедельную отправку по понедельникам в 9:00
    await scheduleBroadcast(
      broadcast.id,
      COMMON_CRON_EXPRESSIONS.WEEKLY_MONDAY_9AM,
      true,
    );

    const translations = await ctx.tm([
      LOCALIZATION_KEYS.BROADCAST_SCHEDULE_SUCCESS,
    ]);
    await ctx.sessionClear?.();
    await ctx.answerCallbackQuery(
      translations[LOCALIZATION_KEYS.BROADCAST_SCHEDULE_SUCCESS],
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

const broadcastScheduleCustomHandler = async (ctx: Context): Promise<void> => {
  const sessionData = ctx.session?.data as any;
  const { title, message, imageUrl } = sessionData ?? {};

  if (!title || !message) {
    await ctx.answerCallbackQuery("Ошибка: данные рассылки не найдены");
    await ctx.sessionClear?.();
    return;
  }

  const translations = await ctx.tm([
    LOCALIZATION_KEYS.BROADCAST_SCHEDULE_CUSTOM_ENTER,
  ]);

  await ctx.editMessageText(
    translations[LOCALIZATION_KEYS.BROADCAST_SCHEDULE_CUSTOM_ENTER],
    {
      reply_markup: undefined,
    },
  );

  if (ctx.sessionSet) {
    await ctx.sessionSet({
      route: "broadcast_schedule_custom_wait",
      data: { title, message, imageUrl, step: "waiting_cron" },
    });
  }
};

export const broadcastCustomCronWait = async (ctx: Context) => {
  const cronExpression = ctx.message?.text?.trim();
  if (!cronExpression) {
    await ctx.reply("Введите cron выражение");
    return;
  }

  if (!BroadcastCronManager.isValidCronExpression(cronExpression)) {
    await ctx.reply(
      "❌ Неверное cron выражение!\n\n" +
        "Формат: минута час день месяц день_недели\n" +
        "Пример: `0 9 * * *` (каждый день в 9:00)",
      { parse_mode: "Markdown" },
    );
    return;
  }

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
      cronExpression,
    });

    await scheduleBroadcast(broadcast.id, cronExpression, true);

    await ctx.sessionClear?.();

    const [titleMsg, keyboard] = await createBroadcastMenuKeyboard(ctx);

    await ctx.editAndReply.reply(titleMsg, {
      reply_markup: keyboard,
    });
  } catch {
    await ctx.sessionClear?.();
  }
};

export default {
  broadcast_schedule_select: broadcastScheduleSelectHandler,
  broadcast_schedule_now: broadcastSendNowHandler,
  broadcast_schedule_daily: broadcastScheduleDailyHandler,
  broadcast_schedule_weekly: broadcastScheduleWeeklyHandler,
  broadcast_schedule_custom: broadcastScheduleCustomHandler,
};
