import { eq, type SQLWrapper } from "drizzle-orm";
import { int, sqliteTable, text } from "drizzle-orm/sqlite-core";

import { drizzle } from "../drizzle";
import { DrizzleOptions } from "../types";
import { getAll, getOne, timestamps } from "../utils";

export const ChatType = {
  private: "private",
  group: "group",
  supergroup: "supergroup",
  channel: "channel",
} as const;

export type ChatType = (typeof ChatType)[keyof typeof ChatType];

export const typeTG = sqliteTable("type_tg", {
  id: int("id").primaryKey({ autoIncrement: true }),
  name: text("name", {
    enum: [
      ChatType.private,
      ChatType.group,
      ChatType.supergroup,
      ChatType.channel,
    ],
  })
    .$type<ChatType>()
    .notNull(),
  enable: int("enable").notNull().default(1),
  ...timestamps,
});

export const getOneTypeTG = async <T extends typeof typeTG>(
  args: Partial<T["$inferSelect"]>,
  options: DrizzleOptions = {},
  ...where: (SQLWrapper | undefined)[]
) => {
  return getOne(typeTG, options)(args, ...where);
};

export const getOneTypeByName = async (
  name: ChatType,
  options: DrizzleOptions = {},
) => {
  const { ctx = drizzle } = options;
  return ctx.select().from(typeTG).where(eq(typeTG.name, name)).get();
};

export const getAllTypeTG = async (
  args: Partial<typeof typeTG.$inferSelect>,
  ...where: (SQLWrapper | undefined)[]
) => {
  return getAll(typeTG)(args, ...where);
};
