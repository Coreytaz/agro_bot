import { SQLiteTable } from "drizzle-orm/sqlite-core";

import { drizzle } from "../drizzle";
import { createOne } from "./createOne";
import { getOne } from "./getOne";

export const findOrCreate = <T extends SQLiteTable>(table: T) => {
  return async (
    args: Partial<T["$inferSelect"]>,
    createArgs: T["$inferInsert"],
  ) =>
    drizzle.transaction(async ctx => {
      const existingRecord = await getOne(table, { ctx })(args);
      if (existingRecord) {
        return existingRecord;
      }
      return await createOne(table, { ctx })(createArgs);
    });
};
