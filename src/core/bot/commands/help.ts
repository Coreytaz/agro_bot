import { Command } from "@grammyjs/commands";

import type { Context } from "../core/interface/Context";
import { createHelpMenuKeyboard } from "../utils/createHelpMenuKeyboard";

export const helpCommand = new Command<Context>(
  "help",
  "Справка по использованию бота",
  async ctx => {
    const [message, keyboard] = await createHelpMenuKeyboard(ctx);

    await ctx.editAndReply.reply(message, {
      reply_markup: keyboard,
      parse_mode: "Markdown",
    });
  },
);

export default helpCommand;
