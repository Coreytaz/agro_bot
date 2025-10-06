import { InlineKeyboard } from "grammy";

import { Context } from "../core/interface/Context";

export const createAdminMenuKeyboard = async (
  ctx: Context,
): Promise<[string, InlineKeyboard]> => {
  const translations = await ctx.tm([
    "admin.menu.title",
    "admin.menu.content",
    "admin.menu.broadcast",
    "admin.menu.model.settings",
    "admin.menu.statistics",
    "admin.menu.users",
  ]);

  return [
    translations["admin.menu.title"],
    new InlineKeyboard()
      .text(translations["admin.menu.content"], "admin_content")
      .row()
      .text(translations["admin.menu.broadcast"], "admin_broadcast")
      .row()
      .text(translations["admin.menu.model.settings"], "admin_model_settings")
      .row()
      .text(translations["admin.menu.statistics"], "admin_statistics")
      .row()
      .text(translations["admin.menu.users"], "admin_users"),
  ];
};
