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

const SETTINGS_LANGUAGE_KEY = "settings.language";
const SETTINGS_LANGUAGE_BACK_KEY = "settings.back";

interface Params {
  // eslint-disable-next-line @typescript-eslint/no-redundant-type-constituents
  locale?: SupportedLocale & string;
}

async function settingsLanguage(ctx: Context) {
  const params = ctx.paramsExtractor?.params as Params;
  const locale = params.locale;

  try {
    if (!locale) throw new Error();

    if (!["ru", "en"].includes(locale)) throw new Error("❌ Неверный язык");

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
    await ctx.answerCallbackQuery("✅ Язык изменен");
  } catch (error) {
    if (error instanceof Error) {
      await ctx.answerCallbackQuery(error.message);
    }
  }

  const translate = await ctx.tm(
    [
      LOCALIZATION_KEYS.SETTINGS_LANGUAGE_SELECT,
      LOCALIZATION_KEYS.LANGUAGE_RU,
      LOCALIZATION_KEYS.LANGUAGE_EN,
      LOCALIZATION_KEYS.BUTTON_BACK,
    ],
    locale,
  );

  try {
    const keyboard = new InlineKeyboard()
      .text(
        translate[LOCALIZATION_KEYS.LANGUAGE_RU],
        `${SETTINGS_LANGUAGE_KEY}{locale:ru}`,
      )
      .text(
        translate[LOCALIZATION_KEYS.LANGUAGE_EN],
        `${SETTINGS_LANGUAGE_KEY}{locale:en}`,
      )
      .row()
      .text(
        translate[LOCALIZATION_KEYS.BUTTON_BACK],
        SETTINGS_LANGUAGE_BACK_KEY,
      );

    await ctx.editAndReply.reply(
      translate[LOCALIZATION_KEYS.SETTINGS_LANGUAGE_SELECT],
      { reply_markup: keyboard },
    );
  } catch (error) {
    if (error instanceof Error) {
      logger.error(error.message);
    }
  }
}

export default {
  [SETTINGS_LANGUAGE_KEY]: settingsLanguage,
  [SETTINGS_LANGUAGE_BACK_KEY]: settings,
};
