import { localizationConfig } from "@config/localization.config";
import { LocalizationKey, SupportedLocale } from "@core/db/interface";
import { getChatSettingsByChatTgId } from "@core/db/models";
import logger from "@core/utils/logger";
import type { NextFunction } from "grammy";

import type { Context } from "../interface/Context";
import { Localization } from "../interface/LocalizationContext";
import { localizationService } from "../utils";

const getUserLocale = async (ctx: Context) => {
  const defaultLocale = localizationConfig.defaultLocale as string;

  try {
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    if (ctx.chatDB) {
      const chatSettings = await getChatSettingsByChatTgId(ctx.chatDB.id);
      if (chatSettings?.locale)
        if (localizationConfig.supportedLocales.includes(chatSettings.locale))
          return chatSettings.locale;
    }

    const userLocale = ctx.from?.language_code ?? defaultLocale;

    const normalizedLocale = userLocale.split("-")[0] as SupportedLocale;

    return localizationConfig.supportedLocales.includes(normalizedLocale)
      ? normalizedLocale
      : defaultLocale;
  } catch (error) {
    logger.warn("Failed to getUserLocale:", error);
    return defaultLocale;
  }
};

const createLocalizationMethods = (locale: string): Localization => {
  return {
    t: async (key: LocalizationKey, targetLocale?: string) => {
      try {
        return await localizationService.translate(key, targetLocale ?? locale);
      } catch (error) {
        logger.error(`Translation error for key "${key}":`, error);
        return `[${key}]`;
      }
    },
    locale,
  };
};

const createFallbackMethods = (locale: string): Localization => {
  return {
    t: (key: string) => Promise.resolve(key),
    locale,
  };
};

const localizationContext = async (ctx: Context) => {
  try {
    const locale = await getUserLocale(ctx);
    ctx.locale = locale;
    return createLocalizationMethods(locale);
  } catch (error) {
    logger.error("Localization context error:", error);
    const defaultLocale = localizationConfig.defaultLocale;
    ctx.locale = defaultLocale;
    return createFallbackMethods(defaultLocale);
  }
};

export default async function localizationMiddleware(
  ctx: Context,
  next: NextFunction,
) {
  const methods = await localizationContext(ctx);
  ctx.t = methods.t;
  await next();
}
