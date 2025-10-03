import { SQLiteTable } from "drizzle-orm/sqlite-core";

import { drizzle } from "../drizzle";
import { DrizzleOptions } from "../types";

export const createOne = <T extends SQLiteTable>(
  table: T,
  options: DrizzleOptions = {},
) => {
  const { ctx = drizzle } = options;
  return async (args: T["$inferInsert"]) => {
    return await ctx.insert(table).values(args).returning().get();
  };
};
