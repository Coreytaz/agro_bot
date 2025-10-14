import type { NextFunction } from "grammy";

import type { Context } from "../core/interface/Context";

export default async function photoUpload(
  ctx: Context,
  next: NextFunction,
): Promise<void> {
  // Устанавливаем состояние ожидания фото
  await ctx.sessionSet?.({
    route: "photo.upload.wait",
    ttlSec: 600, // 10 минут
  });

  await ctx.answerCallbackQuery();
  await ctx.editAndReply.reply(
    "📸 Отправьте фото для загрузки\n\n" +
    "Поддерживаются форматы: JPG, PNG, WEBP\n" +
    "Максимальный размер: 20MB\n\n" +
    "Для отмены используйте /cancel",
  );

  await next();
}