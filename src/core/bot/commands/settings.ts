import { LOCALIZATION_KEYS } from "@config/localization.config";
import { Command } from "@grammyjs/commands";
import { InlineKeyboard } from "grammy";

import type { Context } from "../core/interface/Context";

export const settingsCommand = new Command<Context>(
  "settings",
  "Настройки",
  async ctx => {
    const title = await ctx.t(LOCALIZATION_KEYS.SETTINGS_TITLE);
    const languageButton = await ctx.t(LOCALIZATION_KEYS.SETTINGS_LANGUAGE);

    const keyboard = new InlineKeyboard().text(
      languageButton,
      "settings.language",
    );

    await ctx.editAndReply.reply(title, { reply_markup: keyboard });
  },
);

export default settingsCommand;
