import type { NextFunction } from "grammy";
import { InlineKeyboard } from "grammy";

import type { Context } from "../core/interface/Context";
import { ParamsExtractorDB } from "../core/utils";

export default async function photoUploadWait(
  ctx: Context,
  next: NextFunction,
): Promise<void> {
  const photo = ctx.message?.photo;

  if (!photo) {
    await ctx.editAndReply.reply(
      "❌ Пожалуйста, отправьте фото (или /cancel для отмены)",
    );
    return;
  }

  const bestPhoto = photo[photo.length - 1];

  if (bestPhoto.file_size && bestPhoto.file_size > 20 * 1024 * 1024) {
    // 20MB
    await ctx.editAndReply.reply(
      "❌ Файл слишком большой. Максимальный размер: 20MB\n\n" +
        "Отправьте другое фото или /cancel для отмены",
    );
    return;
  }

  const params = new ParamsExtractorDB("photo.process");
  params.addParams({ fileId: bestPhoto.file_id });

  const keyboard = new InlineKeyboard()
    .text("✅ Обработать фото", await params.toStringAsync())
    .row()
    .text("📸 Загрузить другое фото", "photo.upload")
    .text("🔙 Назад в меню", "menu");

  await ctx.sessionClear?.();

  await ctx.editAndReply.reply(
    `✅ Фото успешно загружено!\n\n` +
      `📊 Информация о файле:\n` +
      `• ID: ${bestPhoto.file_id}\n` +
      `• Размер: ${bestPhoto.width}x${bestPhoto.height}px\n` +
      `• Размер файла: ${bestPhoto.file_size ? `${Math.round(bestPhoto.file_size / 1024)} KB` : "неизвестно"}\n\n` +
      `Выберите действие:`,
    {
      reply_markup: keyboard,
    },
  );

  await next();
}
