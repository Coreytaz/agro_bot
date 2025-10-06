import type { SQLWrapper } from "drizzle-orm";
import { sql } from "drizzle-orm";
import { int, sqliteTable, text } from "drizzle-orm/sqlite-core";

import { getOne, timestamps, updateOne } from "../utils";

export const userBan = sqliteTable("user_ban", {
  id: int().primaryKey({ autoIncrement: true }),
  targetId: text().notNull(),
  targetType: text().notNull().$type<"user" | "chat">(),
  chatId: text().notNull(),
  bannedAt: text()
    .default(sql`(CURRENT_TIMESTAMP)`)
    .notNull(),
  expiresAt: text(),
  reason: text(),
  bannedByAdminId: text().notNull(),
  isActive: int().notNull().default(1),
  ...timestamps,
});

export const getOneUserBan = async <T extends typeof userBan>(
  args: Partial<T["$inferSelect"]>,
  ...where: (SQLWrapper | undefined)[]
) => {
  return getOne(userBan)(args, ...where);
};

export const updateOneUserBan = async <T extends typeof userBan>(
  args: Partial<T["$inferSelect"]>,
  where?: Partial<T["$inferSelect"]>,
  ...rest: (SQLWrapper | undefined)[]
) => {
  return updateOne(userBan)(args, where, ...rest);
};

export const getActiveBan = async (
  targetId: string,
  targetType: "user" | "chat",
  chatId: string,
) => {
  return getOneUserBan({
    targetId,
    targetType,
    chatId,
    isActive: 1,
  });
};

export const getActiveUserBan = async (userId: string, chatId: string) => {
  return getActiveBan(userId, "user", chatId);
};

export const getActiveChatBan = async (chatId: string) => {
  return getActiveBan(chatId, "chat", chatId);
};

export const expireUserBan = async (banId: number) => {
  return updateOneUserBan(
    {
      isActive: 0,
    },
    {
      id: banId,
    },
  );
};
