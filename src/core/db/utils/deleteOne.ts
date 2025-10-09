import { and, eq, type SQLWrapper } from "drizzle-orm";
import type { SQLiteTable } from "drizzle-orm/sqlite-core";

import { drizzle } from "../drizzle";
import { DrizzleOptions } from "../types";

export const deleteOne = <T extends SQLiteTable>(
  table: T,
  options: DrizzleOptions = {},
) => {
  const { ctx = drizzle } = options;
  return async (
    where: Partial<T["$inferSelect"]>,
    ...rest: (SQLWrapper | undefined)[]
  ): Promise<void> => {
    await ctx
      .delete(table)
      .where(
        and(
          ...Object.entries(where).map(([key, value]) =>
            eq(table[key as keyof T] as any, value),
          ),
          ...rest,
        ),
      );
  };
};