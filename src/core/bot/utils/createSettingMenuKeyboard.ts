import { LOCALIZATION_KEYS } from "@config/localization.config";
import { InlineKeyboard } from "grammy";

import { Context } from "../core/interface/Context";

export async function createSettingMenuKeyboard(
  ctx: Context,
): Promise<[string, InlineKeyboard]> {
  const translations = await ctx.tm([
    LOCALIZATION_KEYS.SETTINGS_TITLE,
    LOCALIZATION_KEYS.SETTINGS_LANGUAGE,
    LOCALIZATION_KEYS.SETTINGS_NOTIFICATIONS,
    LOCALIZATION_KEYS.BUTTON_BACK,
  ]);

  const keyboard = new InlineKeyboard()
    .text(
      translations[LOCALIZATION_KEYS.SETTINGS_LANGUAGE],
      "settings.language",
    )
    .row()
    .text(
      translations[LOCALIZATION_KEYS.SETTINGS_NOTIFICATIONS],
      "settings.notification",
    )
    .row()
    .text(translations[LOCALIZATION_KEYS.BUTTON_BACK], "menu");

  return [translations[LOCALIZATION_KEYS.SETTINGS_TITLE], keyboard];
}
