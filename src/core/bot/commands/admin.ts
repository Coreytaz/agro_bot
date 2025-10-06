import { Command } from "@grammyjs/commands";

import type { Context } from "../core/interface/Context";
import { createAdminMenuKeyboard } from "../utils";

const adminCommand = new Command<Context>(
  "admin",
  "Админская команда",
  async ctx => {
    const [title, keyboard] = await createAdminMenuKeyboard(ctx);

    await ctx.reply(title, {
      reply_markup: keyboard,
    });
  },
);

export default adminCommand;
