import { LOCALIZATION_KEYS } from "@config/localization.config";
import { InlineKeyboard } from "grammy";

import { Context } from "../core/interface/Context";

export async function createMainMenuKeyboard(
  ctx: Context,
): Promise<[string, InlineKeyboard]> {
  const translations = await ctx.tm([
    LOCALIZATION_KEYS.MENU_MESSAGE,
    LOCALIZATION_KEYS.MENU_BUTTON_DIAGNOSIS,
    LOCALIZATION_KEYS.MENU_BUTTON_KNOWLEDGE,
    LOCALIZATION_KEYS.MENU_BUTTON_HELP,
    LOCALIZATION_KEYS.MENU_BUTTON_ABOUT,
    LOCALIZATION_KEYS.MENU_BUTTON_SETTINGS,
  ]);

  const keyboard = new InlineKeyboard()
    .text(
      translations[LOCALIZATION_KEYS.MENU_BUTTON_DIAGNOSIS],
      "diagnosis.start",
    )
    .row()
    .text(
      translations[LOCALIZATION_KEYS.MENU_BUTTON_KNOWLEDGE],
      "knowledge.base",
    )
    .row()
    .text(translations[LOCALIZATION_KEYS.MENU_BUTTON_HELP], "help")
    .text(translations[LOCALIZATION_KEYS.MENU_BUTTON_ABOUT], "about")
    .row()
    .text(translations[LOCALIZATION_KEYS.MENU_BUTTON_SETTINGS], "settings");

  return [translations[LOCALIZATION_KEYS.MENU_MESSAGE], keyboard];
}
