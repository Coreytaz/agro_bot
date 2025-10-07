import { int, sqliteTable, text } from "drizzle-orm/sqlite-core";

import { DrizzleOptions } from "../types";
import { createMany, getOne } from "../utils";
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
  args: Omit<typeof paramsTG.$inferInsert, keyof typeof timestamps | "id">,
  options: DrizzleOptions = {},
) => {
  return createOne(paramsTG, options)(args);
};

export const createManyParamsTG = async (
  args: Omit<typeof paramsTG.$inferInsert, keyof typeof timestamps | "id">[],
  options: DrizzleOptions = {},
) => {
  return createMany(paramsTG, options)(args);
};
