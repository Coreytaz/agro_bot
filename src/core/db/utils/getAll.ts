import { and, eq, SQLWrapper } from "drizzle-orm";
import { SQLiteTable } from "drizzle-orm/sqlite-core";

import { drizzle } from "../drizzle";
import type { DrizzleTx } from "../types";

export const getAll = <T extends SQLiteTable>(
  table: T,
  options: { ctx?: typeof drizzle | DrizzleTx } = {},
) => {
  const { ctx = drizzle } = options;
  return async (
    args?: Partial<T["$inferSelect"]>,
    ...rest: (SQLWrapper | undefined)[]
  ) => {
    return ctx
      .select()
      .from(table)
      .where(
        and(
          ...Object.entries(args ?? {}).map(([key, value]) =>
            eq(table[key as keyof T] as any, value),
          ),
          ...rest,
        ),
      )
      .all();
  };
};
