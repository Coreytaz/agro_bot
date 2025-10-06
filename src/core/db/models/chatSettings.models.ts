import { localizationConfig } from "@config/localization.config";
import type { SQLWrapper } from "drizzle-orm";
import { int, sqliteTable, text } from "drizzle-orm/sqlite-core";

import { SupportedLocale } from "../interface";
import { DrizzleOptions } from "../types";
import {
  createOne,
  findAndCountAll,
  findOrCreate,
  getOne,
  timestamps,
  updateOne,
} from "../utils";
import { chatTG } from "./chatTG.models";

export const chatSettings = sqliteTable("chat_settings", {
  id: int().primaryKey({ autoIncrement: true }),
  chatTgId: int()
    .notNull()
    .unique()
    .references(() => chatTG.id),
  locale: text("locale", {
    enum: localizationConfig.supportedLocales,
  })
    .notNull()
    .$type<SupportedLocale>()
    .default(localizationConfig.defaultLocale),
  notifications: int().default(1),
  ...timestamps,
});

export const createOneChatSettings = async <T extends typeof chatSettings>(
  args: Omit<T["$inferInsert"], "id" | "createdAt" | "updatedAt">,
  options: DrizzleOptions = {},
) => {
  return createOne(chatSettings, options)(args);
};

export const findAndCountAllChatSettings = async <
  T extends typeof chatSettings,
>(
  args: Partial<T["$inferSelect"]>,
  options: { limit: number; offset: number },
  ...where: (SQLWrapper | undefined)[]
) => {
  return findAndCountAll(chatSettings)(args, options, ...where);
};

export const getOneChatSettings = async <T extends typeof chatSettings>(
  args: Partial<T["$inferSelect"]>,
  options: DrizzleOptions = {},
  ...where: (SQLWrapper | undefined)[]
) => {
  return getOne(chatSettings, options)(args, ...where);
};

export const updateOneChatSettings = async <T extends typeof chatSettings>(
  args: Partial<T["$inferSelect"]>,
  where?: Partial<T["$inferSelect"]>,
  options: DrizzleOptions = {},
  ...rest: (SQLWrapper | undefined)[]
) => {
  return updateOne(chatSettings, options)(args, where, ...rest);
};

export const findOrCreateChatSettings = async <T extends typeof chatSettings>(
  args: Partial<T["$inferSelect"]>,
  createArgs: T["$inferInsert"],
) => {
  return findOrCreate(chatSettings)(args, createArgs);
};

export const getChatSettingsByChatTgId = async (chatTgId: number) => {
  return getOneChatSettings({ chatTgId });
};

export const createDefaultChatSettings = async (
  chatTgId: number,
  locale: SupportedLocale = "ru",
  options: DrizzleOptions = {},
) => {
  return createOneChatSettings(
    {
      chatTgId,
      locale,
    },
    options,
  );
};
