import { LOCALIZATION_KEYS } from "@config/localization.config";
import {
  createBroadcast,
  deleteBroadcast,
  findAndCountAllBroadcast,
  getBroadcastById,
  updateBroadcast,
} from "@core/db/models";
import { sendBroadcastNow } from "@core/db/utils/broadcastScheduler";
import logger from "@core/utils/logger";
import { InlineKeyboard } from "grammy";

import {
  broadcastCancelCreate,
  broadcastConfirmCreate,
  broadcastSkipImage,
} from "../awaits/broadcast-create-wait";
import type { Context } from "../core/interface/Context";
import { createPagination, ParamsExtractorDB } from "../core/utils";
import { getCronManager } from "../cronManager";
import { createBroadcastMenuKeyboard } from "../utils";

const BROADCAST_LIST_DETAIL_KEY = "broadcast.list.detail";
export const BROADCAST_LIST_KEY = "broadcast.list";
const BROADCAST_MENU_KEY = "broadcast_menu";
const BROADCAST_EDIT_TITLE_KEY = "broadcast.edit.title";
const BROADCAST_TOGGLE_RECURRING_KEY = "broadcast.toggle.recurring";
const BROADCAST_TOGGLE_SCHEDULE_KEY = "broadcast.toggle.schedule";
const BROADCAST_EDIT_CRON_KEY = "broadcast.edit.cron";
const BROADCAST_SCHEDULE_KEY = "broadcast.schedule";
const BROADCAST_DELETE_KEY = "broadcast.delete";
const BROADCAST_DELETE_CONFIRM_KEY = "broadcast.delete.confirm";

const broadcastMenuHandler = async (ctx: Context): Promise<void> => {
  const [title, keyboard] = await createBroadcastMenuKeyboard(ctx);

  await ctx.editAndReply.reply(title, {
    reply_markup: keyboard,
  });
};

const broadcastCreateHandler = async (ctx: Context): Promise<void> => {
  const translations = await ctx.tm([
    LOCALIZATION_KEYS.BROADCAST_CREATE_TITLE,
    LOCALIZATION_KEYS.BROADCAST_CREATE_ENTER_TITLE,
  ]);

  await ctx.editAndReply.reply(
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
  const { title, message, media } = sessionData ?? {};

  if (!title || !message) {
    await ctx.answerCallbackQuery("Ошибка: данные рассылки не найдены");
    await ctx.sessionClear?.();
    return;
  }

  try {
    const broadcast = await createBroadcast({
      title,
      message,
      media,
      createdBy: ctx.chatDB.chatId,
      isRecurring: false,
      isScheduled: false,
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

    await ctx.editAndReply.universalReply({
      content: titleMsg,
      type: "text",
      options: {
        reply_markup: keyboard,
      },
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
  const params = ctx.paramsExtractor?.params ?? {};
  const page = parseInt(params?.page ?? "1");
  const limit = 5;
  const offset = (page - 1) * limit;

  const translations = await ctx.tm([
    LOCALIZATION_KEYS.BROADCAST_MENU_LIST,
    LOCALIZATION_KEYS.BUTTON_BACK,
    LOCALIZATION_KEYS.BUTTON_REFRESH,
  ]);

  try {
    const { data: broadcasts, total } = await findAndCountAllBroadcast(
      {},
      {
        offset,
        limit,
      },
    );

    const totalPages = Math.ceil(total / limit);

    const keyboard = new InlineKeyboard();

    const userParamInstances = broadcasts.map(broadcast => {
      const params = new ParamsExtractorDB(BROADCAST_LIST_DETAIL_KEY);
      params.addParams({ chatId: broadcast.id, page });
      return params;
    });

    const userCallbackDataStrings =
      await ParamsExtractorDB.createManyAsync(userParamInstances);

    for (const [index, broadcast] of broadcasts.entries()) {
      const callbackData = userCallbackDataStrings[index];
      keyboard.text(broadcast.title, callbackData).row();
    }

    await createPagination({
      page,
      count: totalPages,
      route: BROADCAST_LIST_KEY,
      menu: keyboard,
      params,
    });

    keyboard
      .text(translations[LOCALIZATION_KEYS.BUTTON_BACK], BROADCAST_MENU_KEY)
      .row();

    const title = `${translations[LOCALIZATION_KEYS.BROADCAST_MENU_LIST]}\n${page} / ${totalPages}`;

    await ctx.answerCallbackQuery();
    await ctx.editAndReply.reply(title, {
      reply_markup: keyboard,
    });
  } catch (error) {
    if (error instanceof Error) logger.error(error.message);

    const keyboard = new InlineKeyboard();
    const params = new ParamsExtractorDB(BROADCAST_LIST_KEY);
    params.addParams({ page });
    const refreshCallbackData = await params.toStringAsync();

    keyboard
      .text(translations[LOCALIZATION_KEYS.BUTTON_REFRESH], refreshCallbackData)
      .row()
      .text(translations[LOCALIZATION_KEYS.BUTTON_BACK], "admin_back");

    await ctx.answerCallbackQuery();
    await ctx.editAndReply.reply(
      `${translations[LOCALIZATION_KEYS.ADMIN_MENU_CONTENT]}\nОшибка при загрузке данных`,
      {
        reply_markup: keyboard,
      },
    );
  }
};

const broadcastDetailHandler = async (ctx: Context): Promise<void> => {
  const params = ctx.paramsExtractor?.params ?? {};
  const broadcastId = parseInt(params?.chatId ?? "0");
  const page = parseInt(params?.page ?? "1");

  if (!broadcastId) {
    await ctx.answerCallbackQuery("Ошибка: ID рассылки не найден");
    return;
  }

  try {
    const broadcast = await getBroadcastById(broadcastId);

    if (!broadcast) {
      await ctx.answerCallbackQuery("Рассылка не найдена");
      return;
    }

    const keyboard = new InlineKeyboard();

    // Параметры для кнопок редактирования
    const editTitleParams = new ParamsExtractorDB(BROADCAST_EDIT_TITLE_KEY);
    editTitleParams.addParams({ broadcastId, page });
    const editTitleCallback = await editTitleParams.toStringAsync();

    const toggleRecurringParams = new ParamsExtractorDB(
      BROADCAST_TOGGLE_RECURRING_KEY,
    );

    toggleRecurringParams.addParams({ broadcastId, page });
    const toggleRecurringCallback = await toggleRecurringParams.toStringAsync();

    const scheduleToggleParams = new ParamsExtractorDB(
      BROADCAST_TOGGLE_SCHEDULE_KEY,
    );
    scheduleToggleParams.addParams({ broadcastId, page });
    const scheduleToggleCallback = await scheduleToggleParams.toStringAsync();

    const editCronParams = new ParamsExtractorDB(BROADCAST_EDIT_CRON_KEY);
    editCronParams.addParams({ broadcastId, page });
    const editCronCallback = await editCronParams.toStringAsync();

    const scheduleParams = new ParamsExtractorDB(BROADCAST_SCHEDULE_KEY);
    scheduleParams.addParams({ broadcastId, page });
    const scheduleCallback = await scheduleParams.toStringAsync();

    const deleteParams = new ParamsExtractorDB(BROADCAST_DELETE_KEY);
    deleteParams.addParams({ broadcastId, page });
    const deleteCallback = await deleteParams.toStringAsync();

    const backParams = new ParamsExtractorDB(BROADCAST_LIST_KEY);
    backParams.addParams({ page });
    const backCallback = await backParams.toStringAsync();

    keyboard
      .text("📝 Изменить название", editTitleCallback)
      .row()
      .text(
        broadcast.isRecurring
          ? "🔄 Отключить регулярность"
          : "🔄 Сделать регулярным",
        toggleRecurringCallback,
      )
      .row()
      .text(
        broadcast.isScheduled
          ? "🔄 Отключить планирование"
          : "🔄 Сделать планируемым",
        scheduleToggleCallback,
      )
      .row()
      .text("⏰ Изменить расписание", editCronCallback)
      .row()
      .text("⏰ Запланировать рассылку", scheduleCallback)
      .row()
      .text("💀 Удалить", deleteCallback)
      .row()
      .text("⬅️ Назад к списку", backCallback);

    const scheduleStatus = broadcast.isScheduled ? "✅ Да" : "❌ Нет";

    const recurringStatus = broadcast.isRecurring ? "✅ Да" : "❌ Нет";
    const cronInfo = broadcast.cronExpression
      ? `\`${broadcast.cronExpression}\``
      : "Не установлено";

    const statusEmoji =
      {
        draft: "📝",
        sending: "📤",
        sent: "✅",
        error: "❌",
        scheduled: "⏰",
      }[broadcast.status] ?? "📝";

    const detailText = `
📋 *Детали рассылки*

🏷 *Название:* ${broadcast.title}
${statusEmoji} *Статус:* ${broadcast.status}
🔄 *Регулярный:* ${recurringStatus}
🔄 *Запланирован:* ${scheduleStatus}
⏰ *Расписание:* ${cronInfo}
👥 *Всего пользователей:* ${broadcast.totalUsers ?? 0}
✅ *Отправлено:* ${broadcast.sentCount ?? 0}
❌ *Ошибки:* ${broadcast.errorCount ?? 0}
📅 *Создан:* ${new Date(broadcast.created_at).toLocaleDateString("ru-RU")}

📝 *Сообщение:*
${broadcast.message}
    `.trim();

    await ctx.answerCallbackQuery();
    await ctx.editAndReply.reply(detailText, {
      parse_mode: "Markdown",
      reply_markup: keyboard,
    });
  } catch (error) {
    if (error instanceof Error) logger.error(error.message);
    await ctx.answerCallbackQuery("Ошибка при загрузке деталей рассылки");
  }
};

const broadcastEditTitleHandler = async (ctx: Context): Promise<void> => {
  const params = ctx.paramsExtractor?.params ?? {};
  const broadcastId = parseInt(params?.broadcastId ?? "0");
  const page = parseInt(params?.page ?? "1");

  if (!broadcastId) {
    await ctx.answerCallbackQuery("Ошибка: ID рассылки не найден");
    return;
  }

  await ctx.answerCallbackQuery();
  await ctx.editAndReply.reply(
    "📝 *Изменение названия рассылки*\n\nВведите новое название:",
    {
      parse_mode: "Markdown",
    },
  );

  if (ctx.sessionSet) {
    await ctx.sessionSet({
      route: "broadcast_edit_title_wait",
      data: { broadcastId, page },
    });
  }
};

const broadcastToggleScheduleHandler = async (ctx: Context): Promise<void> => {
  const params = ctx.paramsExtractor?.params ?? {};
  const broadcastId = parseInt(params?.broadcastId ?? "0");
  const page = parseInt(params?.page ?? "1");

  if (!broadcastId) {
    await ctx.answerCallbackQuery("Ошибка: ID рассылки не найден");
    return;
  }

  try {
    const broadcast = await getBroadcastById(broadcastId);

    if (!broadcast) {
      await ctx.answerCallbackQuery("Рассылка не найдена");
      return;
    }

    const newSchedulingStatus = !broadcast.isScheduled;

    const newBroadcast = await updateBroadcast(broadcastId, {
      isScheduled: newSchedulingStatus,
      status: newSchedulingStatus ? "scheduled" : "draft",
    });

    const cronManager = getCronManager();

    await cronManager?.scheduleJob(newBroadcast);

    await ctx.answerCallbackQuery(
      newSchedulingStatus
        ? "✅ Рассылка теперь запланирована"
        : "❌ Рассылка больше не запланирована",
    );

    const updatedBroadcast = await getBroadcastById(broadcastId);
    if (updatedBroadcast) {
      const tempParamsExtractor = new ParamsExtractorDB(
        BROADCAST_LIST_DETAIL_KEY,
      );
      tempParamsExtractor.addParams({ chatId: broadcastId, page });
      ctx.paramsExtractor = tempParamsExtractor;
      await broadcastDetailHandler(ctx);
    }
  } catch (error) {
    if (error instanceof Error) logger.error(error.message);
    await ctx.answerCallbackQuery("Ошибка при изменении расписания");
  }
};

const broadcastToggleRecurringHandler = async (ctx: Context): Promise<void> => {
  const params = ctx.paramsExtractor?.params ?? {};
  const broadcastId = parseInt(params?.broadcastId ?? "0");
  const page = parseInt(params?.page ?? "1");

  if (!broadcastId) {
    await ctx.answerCallbackQuery("Ошибка: ID рассылки не найден");
    return;
  }

  try {
    const broadcast = await getBroadcastById(broadcastId);

    if (!broadcast) {
      await ctx.answerCallbackQuery("Рассылка не найдена");
      return;
    }

    const newRecurringStatus = !broadcast.isRecurring;

    await updateBroadcast(broadcastId, {
      isRecurring: newRecurringStatus,
    });

    await ctx.answerCallbackQuery(
      newRecurringStatus
        ? "✅ Рассылка теперь регулярная"
        : "❌ Регулярность отключена",
    );

    const updatedBroadcast = await getBroadcastById(broadcastId);
    if (updatedBroadcast) {
      const tempParamsExtractor = new ParamsExtractorDB(
        BROADCAST_LIST_DETAIL_KEY,
      );
      tempParamsExtractor.addParams({ chatId: broadcastId, page });
      ctx.paramsExtractor = tempParamsExtractor;
      await broadcastDetailHandler(ctx);
    }
  } catch (error) {
    if (error instanceof Error) logger.error(error.message);
    await ctx.answerCallbackQuery("Ошибка при изменении регулярности");
  }
};

const broadcastEditCronHandler = async (ctx: Context): Promise<void> => {
  const params = ctx.paramsExtractor?.params ?? {};
  const broadcastId = parseInt(params?.broadcastId ?? "0");
  const page = parseInt(params?.page ?? "1");

  if (!broadcastId) {
    await ctx.answerCallbackQuery("Ошибка: ID рассылки не найден");
    return;
  }

  await ctx.answerCallbackQuery();
  await ctx.editAndReply.reply(`⏰ Изменение расписания рассылки`);

  if (ctx.sessionSet) {
    await ctx.sessionSet({
      route: "broadcast_edit_cron_wait",
      data: { broadcastId, page },
    });
  }
};

const broadcastScheduleHandler = async (ctx: Context): Promise<void> => {
  const params = ctx.paramsExtractor?.params ?? {};
  const broadcastId = parseInt(params?.broadcastId ?? "0");
  const page = parseInt(params?.page ?? "1");

  if (!broadcastId) {
    await ctx.answerCallbackQuery("Ошибка: ID рассылки не найден");
    return;
  }

  try {
    const broadcast = await getBroadcastById(broadcastId);

    if (!broadcast) {
      await ctx.answerCallbackQuery("Рассылка не найдена");
      return;
    }

    const keyboard = new InlineKeyboard();

    const scheduleNowParams = new ParamsExtractorDB("broadcast.schedule.now");
    scheduleNowParams.addParams({ broadcastId, page });
    const scheduleNowCallback = await scheduleNowParams.toStringAsync();

    const scheduleIn1HourParams = new ParamsExtractorDB(
      "broadcast.schedule.1hour",
    );
    scheduleIn1HourParams.addParams({ broadcastId, page });
    const scheduleIn1HourCallback = await scheduleIn1HourParams.toStringAsync();

    const scheduleCustomParams = new ParamsExtractorDB(
      "broadcast.schedule.custom",
    );
    scheduleCustomParams.addParams({ broadcastId, page });
    const scheduleCustomCallback = await scheduleCustomParams.toStringAsync();

    const backParams = new ParamsExtractorDB(BROADCAST_LIST_DETAIL_KEY);
    backParams.addParams({ chatId: broadcastId, page });
    const backCallback = await backParams.toStringAsync();

    keyboard
      .text("🚀 Отправить сейчас", scheduleNowCallback)
      .row()
      .text("🕐 Через 1 час", scheduleIn1HourCallback)
      .row()
      .text("📅 Выбрать время", scheduleCustomCallback)
      .row()
      .text("⬅️ Назад", backCallback);

    const statusText = broadcast.isScheduled
      ? `✅ Рассылка уже запланирована 
⏰ Расписание: ${`\`${broadcast.cronExpression}\`` || "не установлено"}`
      : "";

    const scheduleText = `📅 Планирование рассылки
${statusText}
Название: ${broadcast.title}
*Статус:* ${broadcast.status}
Выберите, когда отправить рассылку`;

    await ctx.answerCallbackQuery();
    await ctx.editAndReply.reply(scheduleText, {
      parse_mode: "Markdown",
      reply_markup: keyboard,
    });
  } catch (error) {
    if (error instanceof Error) logger.error(error.message);
    await ctx.answerCallbackQuery("Ошибка при планировании рассылки");
  }
};

const broadcastScheduleNowHandler = async (ctx: Context): Promise<void> => {
  const params = ctx.paramsExtractor?.params ?? {};
  const broadcastId = parseInt(params?.broadcastId ?? "0");

  if (!broadcastId) {
    await ctx.answerCallbackQuery("Ошибка: ID рассылки не найден");
    return;
  }

  try {
    const broadcast = await getBroadcastById(broadcastId);

    if (!broadcast) {
      await ctx.answerCallbackQuery("Рассылка не найдена");
      return;
    }

    // Отправляем рассылку немедленно
    await sendBroadcastNow(broadcastId);

    await ctx.answerCallbackQuery("🚀 Рассылка запущена!");

    // Возвращаемся к детальному меню
    const tempParamsExtractor = new ParamsExtractorDB(
      BROADCAST_LIST_DETAIL_KEY,
    );
    tempParamsExtractor.addParams({
      chatId: broadcastId,
      page: parseInt(params?.page ?? "1"),
    });
    ctx.paramsExtractor = tempParamsExtractor;
    await broadcastDetailHandler(ctx);
  } catch (error) {
    if (error instanceof Error) logger.error(error.message);
    await ctx.answerCallbackQuery("Ошибка при запуске рассылки");
  }
};

const broadcastScheduleIn1HourHandler = async (ctx: Context): Promise<void> => {
  const params = ctx.paramsExtractor?.params ?? {};
  const broadcastId = parseInt(params?.broadcastId ?? "0");

  if (!broadcastId) {
    await ctx.answerCallbackQuery("Ошибка: ID рассылки не найден");
    return;
  }

  try {
    // Создаем cron для выполнения через 1 час
    const now = new Date();
    const in1Hour = new Date(now.getTime() + 60 * 60 * 1000);
    const cronExpression = `${in1Hour.getMinutes()} ${in1Hour.getHours()} ${in1Hour.getDate()} ${in1Hour.getMonth() + 1} *`;

    await updateBroadcast(broadcastId, {
      cronExpression,
      isScheduled: true,
      isRecurring: false,
      status: "scheduled",
    });

    await ctx.answerCallbackQuery("🕐 Рассылка запланирована на через 1 час");

    // Возвращаемся к детальному меню
    const tempParamsExtractor = new ParamsExtractorDB(
      BROADCAST_LIST_DETAIL_KEY,
    );
    tempParamsExtractor.addParams({
      chatId: broadcastId,
      page: parseInt(params?.page ?? "1"),
    });
    ctx.paramsExtractor = tempParamsExtractor;
    await broadcastDetailHandler(ctx);
  } catch (error) {
    if (error instanceof Error) logger.error(error.message);
    await ctx.answerCallbackQuery("Ошибка при планировании рассылки");
  }
};

const broadcastScheduleCustomHandler = async (ctx: Context): Promise<void> => {
  const params = ctx.paramsExtractor?.params ?? {};
  const broadcastId = parseInt(params?.broadcastId ?? "0");
  const page = parseInt(params?.page ?? "1");

  if (!broadcastId) {
    await ctx.answerCallbackQuery("Ошибка: ID рассылки не найден");
    return;
  }

  await ctx.answerCallbackQuery();
  await ctx.editAndReply.reply(
    `📅 *Настройка времени отправки*

Введите дату и время в формате:
\`ДД.ММ.ГГГГ ЧЧ:ММ\`

*Примеры:*
• \`15.10.2025 14:30\`
• \`01.11.2025 09:00\`
• \`25.12.2025 18:15\`

Время указывается в формате 24 часа.`,
    {
      parse_mode: "Markdown",
    },
  );

  if (ctx.sessionSet) {
    await ctx.sessionSet({
      route: "broadcast_schedule_datetime_wait",
      data: { broadcastId, page },
    });
  }
};

const broadcastDeleteHandler = async (ctx: Context): Promise<void> => {
  const params = ctx.paramsExtractor?.params ?? {};
  const broadcastId = parseInt(params?.broadcastId ?? "0");
  const page = parseInt(params?.page ?? "1");

  if (!broadcastId) {
    await ctx.answerCallbackQuery("Ошибка: ID рассылки не найден");
    return;
  }

  try {
    const broadcast = await getBroadcastById(broadcastId);

    if (!broadcast) {
      await ctx.answerCallbackQuery("Рассылка не найдена");
      return;
    }

    const keyboard = new InlineKeyboard();

    const confirmParams = new ParamsExtractorDB(BROADCAST_DELETE_CONFIRM_KEY);
    confirmParams.addParams({ broadcastId, page });
    const confirmCallback = await confirmParams.toStringAsync();

    const backParams = new ParamsExtractorDB(BROADCAST_LIST_DETAIL_KEY);
    backParams.addParams({ chatId: broadcastId, page });
    const backCallback = await backParams.toStringAsync();

    keyboard
      .text("🗑 Да, удалить", confirmCallback)
      .text("❌ Отмена", backCallback)
      .row();

    await ctx.answerCallbackQuery();
    await ctx.editAndReply.reply(
      `🗑 *Подтверждение удаления*

Вы действительно хотите удалить рассылку?

*Название:* ${broadcast.title}
*Статус:* ${broadcast.status}

⚠️ *Это действие необратимо!*`,
      {
        parse_mode: "Markdown",
        reply_markup: keyboard,
      },
    );
  } catch (error) {
    if (error instanceof Error) logger.error(error.message);
    await ctx.answerCallbackQuery("Ошибка при попытке удаления");
  }
};

const broadcastDeleteConfirmHandler = async (ctx: Context): Promise<void> => {
  const params = ctx.paramsExtractor?.params ?? {};
  const broadcastId = parseInt(params?.broadcastId ?? "0");

  if (!broadcastId) {
    await ctx.answerCallbackQuery("Ошибка: ID рассылки не найден");
    return;
  }

  try {
    const broadcast = await getBroadcastById(broadcastId);

    if (!broadcast) {
      await ctx.answerCallbackQuery("Рассылка не найдена");
      return;
    }

    await deleteBroadcast(broadcastId);

    await ctx.answerCallbackQuery("✅ рассылка успешно удалена");

    await broadcastListHandler(ctx);
  } catch (error) {
    if (error instanceof Error) logger.error(error.message);
    await ctx.answerCallbackQuery("Ошибка при удалении рассылки");
  }
};

export default {
  broadcast_create: broadcastCreateHandler,
  broadcast_send_now: broadcastSendNowHandler,
  broadcast_confirm_create: broadcastConfirmCreate,
  broadcast_cancel_create: broadcastCancelCreate,
  broadcast_skip_image: broadcastSkipImage,
  [BROADCAST_MENU_KEY]: broadcastMenuHandler,
  [BROADCAST_LIST_KEY]: broadcastListHandler,
  [BROADCAST_LIST_DETAIL_KEY]: broadcastDetailHandler,
  [BROADCAST_EDIT_TITLE_KEY]: broadcastEditTitleHandler,
  [BROADCAST_TOGGLE_RECURRING_KEY]: broadcastToggleRecurringHandler,
  [BROADCAST_TOGGLE_SCHEDULE_KEY]: broadcastToggleScheduleHandler,
  [BROADCAST_EDIT_CRON_KEY]: broadcastEditCronHandler,
  [BROADCAST_SCHEDULE_KEY]: broadcastScheduleHandler,
  "broadcast.schedule.now": broadcastScheduleNowHandler,
  "broadcast.schedule.1hour": broadcastScheduleIn1HourHandler,
  "broadcast.schedule.custom": broadcastScheduleCustomHandler,
  [BROADCAST_DELETE_KEY]: broadcastDeleteHandler,
  [BROADCAST_DELETE_CONFIRM_KEY]: broadcastDeleteConfirmHandler,
};
