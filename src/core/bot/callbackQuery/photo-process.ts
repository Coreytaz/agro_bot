import logger from "@core/utils/logger";
import type { NextFunction } from "grammy";
import { InlineKeyboard } from "grammy";

import type { Context } from "../core/interface/Context";

export default async function photoProcess(
  ctx: Context,
  next: NextFunction,
): Promise<void> {
  const params = ctx.paramsExtractor?.params;
  const fileId = params?.fileId;

  if (!fileId) {
    await ctx.answerCallbackQuery("❌ Ошибка: ID файла не найден");
    return;
  }

  await ctx.answerCallbackQuery("🔄 Обрабатываем фото...");

  try {
    const file = await ctx.api.getFile(fileId);

    console.log(file);

    const path = await file.download("downloads.jpg");

    const url = file.getUrl();

    console.log(path);
    console.log(url);

    // Создаем клавиатуру для дальнейших действий
    const keyboard = new InlineKeyboard()
      .text("📸 Загрузить новое фото", "photo.upload")
      .row()
      .text("🔙 Назад в меню", "menu");

    await ctx.editAndReply.reply(
      `✅ Фото успешно обработано!\n\n` +
        `📁 Путь к файлу: ${file.file_path ?? "неизвестно"}\n` +
        `📊 Размер файла: ${file.file_size ? `${Math.round(file.file_size / 1024)} KB` : "неизвестно"}\n\n` +
        `🤖 Здесь может быть результат анализа фото...\n\n` +
        `Выберите действие:`,
      {
        reply_markup: keyboard,
      },
    );
  } catch (error) {
    logger.error("Ошибка при обработке фото:", error);

    const keyboard = new InlineKeyboard()
      .text("📸 Попробовать снова", "photo.upload")
      .text("🔙 Назад в меню", "menu");

    await ctx.editAndReply.reply(
      "❌ Произошла ошибка при обработке фото\n\n" +
        "Попробуйте загрузить фото снова или вернитесь в главное меню",
      {
        reply_markup: keyboard,
      },
    );
  }

  await next();
}
