import { LOCALIZATION_KEYS } from "@config/localization.config";
import { Command } from "@grammyjs/commands";

import type { Context } from "../core/interface/Context";

export const startCommand = new Command<Context>(
  "start",
  "Стартовое меню",
  async ctx => {
    const startMessage = await ctx.t(LOCALIZATION_KEYS.START_MESSAGE);
    await ctx.editAndReply.reply(startMessage);
  },
);

export default startCommand;