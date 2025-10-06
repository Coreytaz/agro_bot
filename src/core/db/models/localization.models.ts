import { localizationConfig } from "@config/localization.config";
import type { SQLWrapper } from "drizzle-orm";
import { and, eq, inArray } from "drizzle-orm";
import { int, sqliteTable, text } from "drizzle-orm/sqlite-core";

import { drizzle } from "../drizzle";
import { LocalizationKey } from "../interface/Localization";
import { DrizzleOptions } from "../types";
import { getAll, getOne, timestamps } from "../utils";

export const localization = sqliteTable("localization", {
  id: int().primaryKey({ autoIncrement: true }),
  key: text().$type<LocalizationKey>().notNull(),
  locale: text().notNull(),
  value: text().notNull(),
  description: text(),
  ...timestamps,
});

export const getOneLocalization = async <T extends typeof localization>(
  args: Partial<T["$inferSelect"]>,
  ...where: (SQLWrapper | undefined)[]
) => {
  return getOne(localization)(args, ...where);
};

export const getAllLocalization = async <T extends typeof localization>(
  args: Partial<T["$inferSelect"]>,
  options: DrizzleOptions = {},
  ...rest: (SQLWrapper | undefined)[]
) => {
  return getAll(localization, options)(args, ...rest);
};

// Утилиты для работы с локализацией
export const getLocalizationByKey = async (
  key: LocalizationKey,
  locale = "ru",
) => {
  return getOneLocalization({ key, locale });
};

export const getLocalizationsByLocale = async (locale = "ru") => {
  return getAllLocalization({ locale });
};

export const getLocalizationsByKeys = async (
  keys: LocalizationKey[],
  locale = localizationConfig.defaultLocale,
): Promise<Record<string, string>> => {
  if (keys.length === 0) {
    return {};
  }

  const defaultLocale = localizationConfig.defaultLocale;

  return drizzle.transaction(async tx => {
    // Получаем переводы для указанной локали
    const primaryTranslations = await tx
      .select({
        key: localization.key,
        value: localization.value,
      })
      .from(localization)
      .where(
        and(inArray(localization.key, keys), eq(localization.locale, locale)),
      )
      .all();

    const result: Record<string, string> = {};
    const foundKeys = new Set<string>();

    primaryTranslations.forEach(({ key, value }) => {
      result[key] = value;
      foundKeys.add(key);
    });

    const missingKeys = keys.filter(key => !foundKeys.has(key));

    if (missingKeys.length > 0 && locale !== defaultLocale) {
      const fallbackTranslations = await tx
        .select({
          key: localization.key,
          value: localization.value,
        })
        .from(localization)
        .where(
          and(
            inArray(localization.key, missingKeys),
            eq(localization.locale, defaultLocale),
          ),
        )
        .all();

      fallbackTranslations.forEach(({ key, value }) => {
        if (!result[key]) {
          result[key] = value;
          foundKeys.add(key);
        }
      });
    }

    keys.forEach(key => {
      if (!foundKeys.has(key)) {
        result[key] = `[${key}]`;
      }
    });

    return result;
  });
};
