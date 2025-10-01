import { and, eq, gt, isNull, or, sql } from "drizzle-orm";
import { int, primaryKey, sqliteTable, text } from "drizzle-orm/sqlite-core";

import { drizzle } from "../drizzle";
import { DrizzleOptions } from "../types";
import { timestamps } from "../utils/timestamps.helpers";
import { chatTG } from "./chatTG.models";

export const sessionTG = sqliteTable(
  "session_tg",
  {
    chatId: text("chat_id")
      .notNull()
      .references(() => chatTG.chatId, { onDelete: "cascade" }),
    userId: text("user_id").notNull(),
    route: text("route"),
    data: text("data", { mode: "json" }).notNull().default({}),
    isActive: int("is_active").notNull().default(0),
    expiresAt: text("expires_at"),
    ...timestamps,
  },
  t => [primaryKey({ columns: [t.chatId, t.userId] })],
);

export const getActiveSession = async (
  chatId: string,
  userId: string,
  options: DrizzleOptions = {},
) => {
  const { ctx = drizzle } = options;
  return ctx
    .select()
    .from(sessionTG)
    .where(
      and(
        eq(sessionTG.chatId, chatId),
        eq(sessionTG.userId, userId),
        eq(sessionTG.isActive, 1),
        or(isNull(sessionTG.expiresAt), gt(sessionTG.expiresAt, sql`CURRENT_TIMESTAMP`)),
      ),
    )
    .get();
};

export const upsertSession = async (
  args: Pick<
    typeof sessionTG.$inferInsert,
    "chatId" | "userId" | "route" | "data" | "isActive" | "expiresAt"
  >,
  options: DrizzleOptions = {},
) => {
  const { ctx = drizzle } = options;
  return ctx
    .insert(sessionTG)
    .values(args)
    .onConflictDoUpdate({
      target: [sessionTG.chatId, sessionTG.userId],
      set: {
        route: args.route,
        data: args.data ?? {},
        isActive: args.isActive ?? 1,
        expiresAt: args.expiresAt,
      },
    });
};

export const clearSession = async (
  chatId: string,
  userId: string,
  options: DrizzleOptions = {},
) => {
  const { ctx = drizzle } = options;
  return ctx
    .insert(sessionTG)
    .values({ chatId, userId, isActive: 0, data: {}, route: null })
    .onConflictDoUpdate({
      target: [sessionTG.chatId, sessionTG.userId],
      set: { isActive: 0, data: {}, route: null, expiresAt: null },
    });
};
