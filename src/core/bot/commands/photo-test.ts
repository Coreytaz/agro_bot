import { Command } from "@grammyjs/commands";
import { InlineKeyboard } from "grammy";

import type { Context } from "../core/interface/Context";

export const photoTestCommand = new Command<Context>(
  "photo_test",
  "Тестовое меню для загрузки фото",
  async (ctx: Context) => {
    const keyboard = new InlineKeyboard()
      .text("📸 Загрузить фото", "photo.upload")
      .row()
      .text("🔙 Назад в меню", "menu");

    await ctx.editAndReply.reply(
      "🧪 Тестовое меню для загрузки фото\n\nВыберите действие:",
      {
        reply_markup: keyboard,
      }
    );
  },
);

export default photoTestCommand;