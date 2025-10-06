import { LOCALIZATION_KEYS } from "@config/localization.config";
import { InlineKeyboard } from "grammy";

import { Context } from "../core/interface/Context";

export const createHelpMenuKeyboard = async (
  ctx: Context,
): Promise<[string, InlineKeyboard]> => {
  const translations = await ctx.tm([
    LOCALIZATION_KEYS.HELP_MESSAGE,
    LOCALIZATION_KEYS.BUTTON_BACK,
  ]);

  return [
    translations[LOCALIZATION_KEYS.HELP_MESSAGE],
    new InlineKeyboard().text(
      translations[LOCALIZATION_KEYS.BUTTON_BACK],
      "menu",
    ),
  ];
};
