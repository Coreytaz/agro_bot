import { Command } from "@grammyjs/commands";

import type { Context } from "../core/interface/Context";
import { createSettingMenuKeyboard } from "../utils/createSettingMenuKeyboard";

export const settingsCommand = new Command<Context>(
  "settings",
  "Настройки",
  async ctx => {
    const [title, keyboard] = await createSettingMenuKeyboard(ctx);
    await ctx.editAndReply.reply(title, { reply_markup: keyboard });
  },
);

export default settingsCommand;
