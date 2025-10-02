import { inArray } from "drizzle-orm";
import { int, sqliteTable, text } from "drizzle-orm/sqlite-core";

import { type KeyLogger, type LoggerData, loggerDatapaths } from "../config";
import type { DrizzleOptions } from "../types";
import { getAll, timestamps } from "../utils";

export const loggerSettingsTG = sqliteTable("logger_settings_tg", {
  id: int().primaryKey({ autoIncrement: true }),
  chatId: text("chat_id").notNull().unique(),
  data: text("data", { mode: "json" }).$type<Record<KeyLogger, LoggerData>>(),
  ...timestamps,
});

export const filterChatIdsByDatapath = async (
  chatIds: string[],
  datapath: KeyLogger,
  options: DrizzleOptions = {},
) => {
  const configs = new Map(
    (
      await getAll(loggerSettingsTG, options)(
        {},
        inArray(loggerSettingsTG.chatId, chatIds),
      )
    ).map(r => [r.chatId, r.data] as [string, Record<KeyLogger, LoggerData>]),
  );

  const defaultActive = loggerDatapaths[datapath].active;

  return chatIds.filter(id => {
    const config = configs.get(id);
    const active = config?.[datapath].active ?? defaultActive;
    return active;
  });
};
