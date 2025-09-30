import { int, sqliteTable, text } from "drizzle-orm/sqlite-core";

import { DrizzleOptions } from "../types";
import { getOne } from "../utils";
import { createOne } from "../utils/createOne";
import { timestamps } from "../utils/timestamps.helpers";

export const paramsTG = sqliteTable("params_tg", {
  id: int("id").primaryKey({ autoIncrement: true }),
  data: text("data", { mode: "json" }).notNull().default({}),
  relationKey: text("relationKey")
    .$defaultFn(() => crypto.randomUUID())
    .notNull(),
  ...timestamps,
});

export const getOneParamsTG = async (
  args: Partial<typeof paramsTG.$inferSelect>,
  options: DrizzleOptions = {},
) => {
  const { ctx } = options;
  return getOne(paramsTG, { ctx })(args);
};

export const createOneParamsTG = async (
  args: Omit<typeof paramsTG.$inferInsert, keyof typeof timestamps>,
) => {
  return createOne(paramsTG)(args);
};
