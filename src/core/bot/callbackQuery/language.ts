import { LOCALIZATION_KEYS } from "@config/localization.config";
import { drizzle } from "@core/db";
import { SupportedLocale } from "@core/db/interface";
import {
  createOneChatSettings,
  getOneChatSettings,
  updateOneChatSettings,
} from "@core/db/models";
import logger from "@core/utils/logger";
import { InlineKeyboard } from "grammy";

import type { Context } from "../core/interface/Context";
import settings from "./settings";

async function settingsLanguage(ctx: Context) {
  try {
    const selectText = await ctx.t(LOCALIZATION_KEYS.SETTINGS_LANGUAGE_SELECT);
    const ruText = await ctx.t(LOCALIZATION_KEYS.LANGUAGE_RU);
    const enText = await ctx.t(LOCALIZATION_KEYS.LANGUAGE_EN);
    const backText = await ctx.t(LOCALIZATION_KEYS.BUTTON_BACK);

    const keyboard = new InlineKeyboard()
      .text(ruText, "settings.language.set{locale:ru}")
      .text(enText, "settings.language.set{locale:en}")
      .row()
      .text(backText, "settings.back");

    await ctx.editAndReply.reply(selectText, { reply_markup: keyboard });
  } catch (error) {
    logger.error("Error in settings language callback:", error);
    await ctx.editAndReply.reply("❌ Произошла ошибка");
  }
}

interface Params {
  // eslint-disable-next-line @typescript-eslint/no-redundant-type-constituents
  locale?: SupportedLocale & string;
}

export async function settingsLanguageSet(ctx: Context) {
  try {
    const params = ctx.paramsExtractor?.params as Params;
    const locale = params.locale;

    if (!locale || !["ru", "en"].includes(locale)) {
      await ctx.editAndReply.reply("❌ Неверный язык");
      return;
    }

    await drizzle.transaction(async tx => {
      let chatSettings = await getOneChatSettings(
        { chatTgId: ctx.chatDB.id },
        { ctx: tx },
      );

      chatSettings ??= await createOneChatSettings(
        { chatTgId: ctx.chatDB.id },
        { ctx: tx },
      );

      await updateOneChatSettings(
        { locale },
        { id: chatSettings.id },
        { ctx: tx },
      );
    });

    const confirmText = await ctx.t(
      LOCALIZATION_KEYS.SETTINGS_LANGUAGE_CHANGED,
      locale,
    );
    const backText = await ctx.t(LOCALIZATION_KEYS.BUTTON_BACK, locale);

    const keyboard = new InlineKeyboard().text(backText, "settings.language");

    await ctx.editAndReply.reply(confirmText, { reply_markup: keyboard });
  } catch (error) {
    logger.error("Error in settings language set callback:", error);
    await ctx.editAndReply.reply("❌ Произошла ошибка");
  }
}

export async function settingsBack(ctx: Context) {
  try {
    const title = await ctx.t(LOCALIZATION_KEYS.SETTINGS_TITLE);
    const languageButton = await ctx.t(LOCALIZATION_KEYS.SETTINGS_LANGUAGE);

    const keyboard = new InlineKeyboard().text(
      languageButton,
      "settings.language",
    );

    await ctx.editAndReply.reply(title, { reply_markup: keyboard });
  } catch (error) {
    logger.error("Error in settings back callback:", error);
    await ctx.editAndReply.reply("❌ Произошла ошибка");
  }
}

export default {
  "settings.language": settingsLanguage,
  "settings.language.set": settingsLanguageSet,
  "settings.back": settings,
};
