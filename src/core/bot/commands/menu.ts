import { Command } from "@grammyjs/commands";
import { InlineKeyboard } from "grammy";

import type { Context } from "../core/interface/Context";

const keyboard = new InlineKeyboard()
  .text("Переименовать карточку", "card.rename{id:1}")
  .row()
  .text("Долгая обработка (прогресс)", "process.start")
  .row()
  .text("Ждать стикер", "sticker.wait.start");

export const menuCommand = new Command<Context>(
  "menu",
  "Главное меню",
  async ctx => {
    const title = await ctx.t("menu.title");

    await ctx.editAndReply.reply(title, { reply_markup: keyboard });
  },
);

export default menuCommand;
