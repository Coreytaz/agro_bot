import { LOCALIZATION_KEYS } from "@config/localization.config";
import { InlineKeyboard } from "grammy";

import { BROADCAST_LIST_KEY } from "../callbackQuery/broadcast";
import { Context } from "../core/interface/Context";

export const createBroadcastMenuKeyboard = async (
  ctx: Context,
): Promise<[string, InlineKeyboard]> => {
  const translations = await ctx.tm([
    LOCALIZATION_KEYS.BROADCAST_MENU_TITLE,
    LOCALIZATION_KEYS.BROADCAST_MENU_CREATE,
    LOCALIZATION_KEYS.BROADCAST_MENU_LIST,
    LOCALIZATION_KEYS.COMMON_BACK,
  ]);

  return [
    translations[LOCALIZATION_KEYS.BROADCAST_MENU_TITLE],
    new InlineKeyboard()
      .text(
        translations[LOCALIZATION_KEYS.BROADCAST_MENU_CREATE],
        "broadcast_create",
      )
      .row()
      .text(
        translations[LOCALIZATION_KEYS.BROADCAST_MENU_LIST],
        BROADCAST_LIST_KEY,
      )
      .row()
      .text(translations[LOCALIZATION_KEYS.COMMON_BACK], "admin_back"),
  ];
};
