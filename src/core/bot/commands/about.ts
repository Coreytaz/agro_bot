import { Command } from "@grammyjs/commands";

import type { Context } from "../core/interface/Context";
import { createAboutMenuKeyboard } from "../utils";

export const aboutCommand = new Command<Context>(
  "about",
  "О боте",
  async ctx => {
    const [message, keyboard] = await createAboutMenuKeyboard(ctx);

    await ctx.editAndReply.reply(message, {
      reply_markup: keyboard,
      parse_mode: "Markdown",
    });
  },
);

export default aboutCommand;
