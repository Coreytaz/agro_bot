import type { NextFunction } from "grammy";

import type { Context } from "../core/interface/Context";
import { progressBar, sleep } from "../core/utils/progress";

export default async function processStart(ctx: Context, next: NextFunction) {
  await ctx.answerCallbackQuery();

  const chatId = Number(ctx.chat?.id);
  const initial = await ctx.api.sendMessage(chatId, progressBar(0));
  const messageId = initial.message_id;

  // Запускаем фоновое обновление прогресса без блокировки потока
  void (async () => {
    try {
      for (const p of [10, 25, 40, 60, 80, 95, 100]) {
        await sleep(500); // имитация ожидания запроса/обработки
        await ctx.api.editMessageText(chatId, messageId, progressBar(p));
      }
      await ctx.api.editMessageText(chatId, messageId, "Готово! Результат обработки: ...");
    } catch {
      // опционально: логировать ошибку
    }
  })();

  // Немедленно продолжаем цепочку — бот не блокируется
  await next();
}
