import { Command } from "@grammyjs/commands";

import type { Context } from "../core/interface/Context";
import { createBroadcastMenuKeyboard } from "../utils";

const broadcastCommand = new Command<Context>(
  "broadcast",
  "Управление рассылками",
  async ctx => {
    const [title, keyboard] = await createBroadcastMenuKeyboard(ctx);

    await ctx.reply(title, {
      reply_markup: keyboard,
    });
  },
);

export default broadcastCommand;