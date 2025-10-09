import logger from "@core/utils/logger";

import { getBroadcastById, updateBroadcast } from "../../db/models";
import type { Context } from "../core/interface/Context";
import { ParamsExtractorDB } from "../core/utils";

const BROADCAST_LIST_DETAIL_KEY = "broadcast.list.detail";

// Валидация cron выражения
const isValidCronExpression = (cron: string): boolean => {
  const cronRegex =
    /^(\*|[0-5]?\d) (\*|[01]?\d|2[0-3]) (\*|[12]?\d|3[01]) (\*|[0]?\d|1[0-2]) (\*|[0-6])$/;
  return cronRegex.test(cron.trim());
};

export const broadcastEditTitleWait = async (ctx: Context) => {
  const newTitle = ctx.message?.text?.trim();

  if (!newTitle) {
    await ctx.editAndReply.reply(
      "❌ Название не может быть пустым. Введите новое название:",
    );
    return;
  }

  if (newTitle.length > 100) {
    await ctx.editAndReply.reply(
      "❌ Название слишком длинное (максимум 100 символов). Введите новое название:",
    );
    return;
  }

  const sessionData = ctx.session?.data as any;
  const broadcastId = sessionData?.broadcastId;
  const page = sessionData?.page ?? 1;

  if (!broadcastId) {
    await ctx.editAndReply.reply("❌ Сессия устарела, попробуйте ещё раз");
    await ctx.sessionClear?.();
    return;
  }

  try {
    const broadcast = await getBroadcastById(broadcastId);

    if (!broadcast) {
      await ctx.editAndReply.reply("❌ Бродкаст не найден");
      await ctx.sessionClear?.();
      return;
    }

    await updateBroadcast(broadcastId, {
      title: newTitle,
    });

    await ctx.sessionClear?.();

    const detailParams = new ParamsExtractorDB(BROADCAST_LIST_DETAIL_KEY);
    detailParams.addParams({ chatId: broadcastId, page });
    const detailCallback = await detailParams.toStringAsync();

    const keyboard = {
      inline_keyboard: [
        [{ text: "📋 Вернуться к деталям", callback_data: detailCallback }],
      ],
    };

    await ctx.editAndReply.reply("✅ Название успешно изменено!", {
      reply_markup: keyboard,
    });
  } catch (error) {
    if (error instanceof Error) logger.error(error.message);
    await ctx.editAndReply.reply("❌ Ошибка при изменении названия");
    await ctx.sessionClear?.();
  }
};

export const broadcastEditCronWait = async (ctx: Context) => {
  const newCron = ctx.message?.text?.trim();

  if (!newCron) {
    await ctx.editAndReply.reply(
      `❌ Cron выражение не может быть пустым. 

Примеры
\`0 9 * * *\` - каждый день в 9:00
\`0 9 * * 1\` - каждый понедельник в 9:00  
\`0 9 1 * *\` - 1 числа каждого месяца в 9:00
\`0 */6 * * *\` - каждые 6 часов

Введите новое cron выражение:`,
      { parse_mode: "Markdown" },
    );
    return;
  }

  if (!isValidCronExpression(newCron)) {
    await ctx.editAndReply.reply(
      `❌ Неверный формат cron выражения. 

Примеры корректных выражений
- \`0 9 * * *\` - каждый день в 9:00
- \`0 9 * * 1\` - каждый понедельник в 9:00  
- \`0 9 1 * *\` - 1 числа каждого месяца в 9:00
- \`0 */6 * * *\` - каждые 6 часов
- \`30 14 * * 5\` - каждую пятницу в 14:30

Попробуйте еще раз`,
      { parse_mode: "Markdown" },
    );
    return;
  }

  const sessionData = ctx.session?.data as any;
  const broadcastId = sessionData?.broadcastId;
  const page = sessionData?.page ?? 1;

  if (!broadcastId) {
    await ctx.editAndReply.reply("❌ Сессия устарела, попробуйте ещё раз");
    await ctx.sessionClear?.();
    return;
  }

  try {
    const broadcast = await getBroadcastById(broadcastId);

    if (!broadcast) {
      await ctx.editAndReply.reply("❌ Бродкаст не найден");
      await ctx.sessionClear?.();
      return;
    }

    // Обновляем cron расписание и автоматически включаем регулярность
    await updateBroadcast(broadcastId, {
      cronExpression: newCron,
    });

    await ctx.sessionClear?.();

    const detailParams = new ParamsExtractorDB(BROADCAST_LIST_DETAIL_KEY);
    detailParams.addParams({ chatId: broadcastId, page });
    const detailCallback = await detailParams.toStringAsync();

    const keyboard = {
      inline_keyboard: [
        [{ text: "📋 Вернуться к деталям", callback_data: detailCallback }],
      ],
    };

    await ctx.editAndReply.reply(
      `✅ Расписание успешно изменено!

⏰ *Новое расписание:* \`${newCron}\``,
      { reply_markup: keyboard, parse_mode: "Markdown" },
    );
  } catch (error) {
    if (error instanceof Error) logger.error(error.message);
    await ctx.editAndReply.reply("❌ Ошибка при изменении расписания");
    await ctx.sessionClear?.();
  }
};

export const broadcastScheduleDatetimeWait = async (ctx: Context) => {
  const dateTimeInput = ctx.message?.text?.trim();

  if (!dateTimeInput) {
    await ctx.reply(
      `❌ Дата и время не могут быть пустыми.

Введите дату и время в формате: \`ДД.ММ.ГГГГ ЧЧ:ММ\`

*Примеры:*
• \`15.10.2025 14:30\`
• \`01.11.2025 09:00\``,
      { parse_mode: "Markdown" },
    );
    return;
  }

  // Парсим дату и время
  const dateTimeRegex = /^(\d{2})\.(\d{2})\.(\d{4})\s+(\d{1,2}):(\d{2})$/;
  const match = dateTimeRegex.exec(dateTimeInput);

  if (!match) {
    await ctx.reply(
      `❌ Неверный формат даты и времени.

Используйте формат: \`ДД.ММ.ГГГГ ЧЧ:ММ\`

*Примеры:*
• \`15.10.2025 14:30\`
• \`01.11.2025 09:00\`
• \`25.12.2025 18:15\``,
      { parse_mode: "Markdown" },
    );
    return;
  }

  const [, day, month, year, hours, minutes] = match;
  const targetDate = new Date(
    parseInt(year),
    parseInt(month) - 1,
    parseInt(day),
    parseInt(hours),
    parseInt(minutes),
  );

  // Проверяем, что дата валидна и в будущем
  const now = new Date();
  if (targetDate <= now) {
    await ctx.reply(
      `❌ Дата и время должны быть в будущем.

Текущее время: ${now.toLocaleString("ru-RU")}
Введенное время: ${targetDate.toLocaleString("ru-RU")}

Введите корректную дату и время:`,
      { parse_mode: "Markdown" },
    );
    return;
  }

  // Проверяем, что дата не слишком далеко в будущем (например, не больше года)
  const oneYearFromNow = new Date(now.getTime() + 365 * 24 * 60 * 60 * 1000);
  if (targetDate > oneYearFromNow) {
    await ctx.reply(
      `❌ Дата слишком далеко в будущем (максимум 1 год).

Введите дату ближе к текущему времени:`,
      { parse_mode: "Markdown" },
    );
    return;
  }

  const sessionData = ctx.session?.data as any;
  const broadcastId = sessionData?.broadcastId;
  const page = sessionData?.page ?? 1;

  if (!broadcastId) {
    await ctx.reply("❌ Сессия устарела, попробуйте ещё раз");
    await ctx.sessionClear?.();
    return;
  }

  try {
    const broadcast = await getBroadcastById(broadcastId);

    if (!broadcast) {
      await ctx.reply("❌ Рассылка не найдена");
      await ctx.sessionClear?.();
      return;
    }

    const cronExpression = `${targetDate.getMinutes()} ${targetDate.getHours()} ${targetDate.getDate()} ${targetDate.getMonth() + 1} *`;

    await updateBroadcast(broadcastId, {
      cronExpression,
      isScheduled: true,
      isRecurring: false,
      status: "scheduled",
    });

    await ctx.sessionClear?.();

    const detailParams = new ParamsExtractorDB(BROADCAST_LIST_DETAIL_KEY);
    detailParams.addParams({ chatId: broadcastId, page });
    const detailCallback = await detailParams.toStringAsync();

    const keyboard = {
      inline_keyboard: [
        [{ text: "📋 Вернуться к деталям", callback_data: detailCallback }],
      ],
    };

    await ctx.reply(
      `✅ Рассылка запланирована!

📅 *Дата и время отправки:* ${targetDate.toLocaleString("ru-RU")}
⏰ *Cron выражение:* \`${cronExpression}\``,
      { reply_markup: keyboard, parse_mode: "Markdown" },
    );
  } catch (error) {
    if (error instanceof Error) logger.error(error.message);
    await ctx.reply("❌ Ошибка при планировании рассылки");
    await ctx.sessionClear?.();
  }
};

export default {
  broadcast_edit_title_wait: broadcastEditTitleWait,
  broadcast_edit_cron_wait: broadcastEditCronWait,
  broadcast_schedule_datetime_wait: broadcastScheduleDatetimeWait,
};
