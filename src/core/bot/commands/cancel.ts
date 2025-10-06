import { Command } from "@grammyjs/commands";

import type { Context } from "../core/interface/Context";

const cancelCommand = new Command<Context>(
  "cancel",
  "Отменить текущее действие",
  async ctx => {
    if (ctx.session?.route) {
      await ctx.sessionClear?.();
      await ctx.editAndReply.reply("Действие отменено");
    } else {
      await ctx.editAndReply.reply("Нет активного действия для отмены");
    }
  },
);

export default cancelCommand;
