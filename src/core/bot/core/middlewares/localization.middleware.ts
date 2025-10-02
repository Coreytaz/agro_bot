import { localizationConfig } from "@core/bot/core/config";
import { LocalizationKey } from "@core/db/models";
import logger from "@core/utils/logger";
import type { NextFunction } from "grammy";

import type { Context } from "../interface/Context";
import { Localization } from "../interface/LocalizationContext";
import { localizationService } from "../utils";

const getUserLocale = (ctx: Context): string => {
  const userLocale =
    ctx.from?.language_code ?? localizationConfig.defaultLocale;

  const normalizedLocale = userLocale.split("-")[0];

  return localizationConfig.supportedLocales.includes(normalizedLocale)
    ? normalizedLocale
    : localizationConfig.defaultLocale;
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

const localizationContext = (ctx: Context) => {
  const locale = getUserLocale(ctx);
  try {
    ctx.locale = locale;
    return createLocalizationMethods(locale);
  } catch (error) {
    logger.error("Localization context error:", error);
    ctx.locale = localizationConfig.defaultLocale;
    return createFallbackMethods(locale);
  }
};

export default async function localizationMiddleware(
  ctx: Context,
  next: NextFunction,
) {
  const methods = localizationContext(ctx);
  ctx.t = methods.t;
  await next();
}
