import { SQLiteTable } from "drizzle-orm/sqlite-core";

import { drizzle } from "../drizzle";
import { DrizzleOptions } from "../types";

export const createMany = <T extends SQLiteTable>(
  table: T,
  options: DrizzleOptions = {},
) => {
  const { ctx = drizzle } = options;
  return async (args: T["$inferInsert"][]) => {
    if (args.length === 0) {
      return [];
    }
    return await ctx.insert(table).values(args).returning();
  };
};