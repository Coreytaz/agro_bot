import type { SQLWrapper } from "drizzle-orm";
import { int, sqliteTable, text } from "drizzle-orm/sqlite-core";

import { LocalizationKey } from "../interface/Localization";
import { DrizzleOptions } from "../types";
import {
  createOne,
  findAndCountAll,
  getAll,
  getOne,
  timestamps,
  updateOne,
} from "../utils";

export const localization = sqliteTable("localization", {
  id: int().primaryKey({ autoIncrement: true }),
  key: text().$type<LocalizationKey>().notNull(),
  locale: text().notNull(),
  value: text().notNull(),
  description: text(),
  ...timestamps,
});

export const createOneLocalization = async <T extends typeof localization>(
  args: Omit<T["$inferInsert"], "id" | "createdAt" | "updatedAt">,
) => {
  return createOne(localization)(args as any);
};

export const findAndCountAllLocalization = async <
  T extends typeof localization,
>(
  args: Partial<T["$inferSelect"]>,
  options: { limit: number; offset: number },
  ...where: (SQLWrapper | undefined)[]
) => {
  return findAndCountAll(localization)(args, options, ...where);
};

export const getOneLocalization = async <T extends typeof localization>(
  args: Partial<T["$inferSelect"]>,
  ...where: (SQLWrapper | undefined)[]
) => {
  return getOne(localization)(args, ...where);
};

export const updateOneLocalization = async <T extends typeof localization>(
  args: Partial<T["$inferSelect"]>,
  where?: Partial<T["$inferSelect"]>,
  ...rest: (SQLWrapper | undefined)[]
) => {
  return updateOne(localization)(args, where, ...rest);
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
