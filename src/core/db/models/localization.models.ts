import { localizationConfig } from "@config/localization.config";
import { groupBy } from "@core/utils/groupBy";
import type { SQLWrapper } from "drizzle-orm";
import { and, eq, inArray } from "drizzle-orm";
import { int, sqliteTable, text } from "drizzle-orm/sqlite-core";

import { drizzle } from "../drizzle";
import { LocalizationKey, SupportedLocale } from "../interface/Localization";
import { DrizzleOptions } from "../types";
import { getAll, getOne, timestamps, updateOne } from "../utils";

export const localization = sqliteTable("localization", {
  id: int().primaryKey({ autoIncrement: true }),
  key: text().$type<LocalizationKey>().notNull(),
  locale: text().$type<SupportedLocale>().notNull(),
  value: text().notNull(),
  description: text(),
  ...timestamps,
});

export const updateOneLocalization = async <T extends typeof localization>(
  args: Partial<T["$inferSelect"]>,
  where?: Partial<T["$inferSelect"]>,
  ...rest: (SQLWrapper | undefined)[]
) => {
  return updateOne(localization)(args, where, ...rest);
};

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
  locale: SupportedLocale = "ru",
) => {
  return getOneLocalization({ key, locale });
};

export const getLocalizationsByLocale = async (
  locale: SupportedLocale = "ru",
) => {
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

export const getGroupedLocalizationByKey = async (key: LocalizationKey) => {
  const records = await getAllLocalization({ key });
  const groupByLocale = groupBy(records, "locale");
  return groupByLocale;
};

export const getGroupedLocalizationWithPagination = async (
  targetLocale: string,
  options: { limit: number; offset: number },
) => {
  return drizzle.transaction(async tx => {
    // Получаем уникальные ключи с пагинацией
    const uniqueKeys = await tx
      .selectDistinct({ key: localization.key })
      .from(localization)
      .limit(options.limit)
      .offset(options.offset)
      .all();

    // Получаем общее количество уникальных ключей
    const totalCount = await tx
      .selectDistinct({ key: localization.key })
      .from(localization)
      .then(result => result.length);

    if (uniqueKeys.length === 0) {
      return { data: [], total: totalCount };
    }

    const keys = uniqueKeys.map(item => item.key);

    // Получаем данные для всех найденных ключей
    const localizationData = await tx
      .select({
        key: localization.key,
        locale: localization.locale,
        value: localization.value,
        description: localization.description,
      })
      .from(localization)
      .where(inArray(localization.key, keys))
      .all();

    // Группируем данные по ключам
    const groupedData = keys.map(key => {
      const records = localizationData.filter(item => item.key === key);
      const targetRecord = records.find(item => item.locale === targetLocale);
      const fallbackRecord = records.find(
        item => item.locale === localizationConfig.defaultLocale,
      );

      return {
        key,
        value: targetRecord?.value ?? fallbackRecord?.value ?? `[${key}]`,
        description:
          targetRecord?.description ?? fallbackRecord?.description ?? "",
        availableLocales: records.map(item => item.locale),
      };
    });

    return { data: groupedData, total: totalCount };
  });
};
