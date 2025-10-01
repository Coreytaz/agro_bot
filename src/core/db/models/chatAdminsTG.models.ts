import { and, eq, type SQLWrapper } from "drizzle-orm";
import { int, primaryKey, sqliteTable, text } from "drizzle-orm/sqlite-core";

import { drizzle } from "../drizzle";
import { DrizzleOptions } from "../types";
import { getAll, timestamps } from "../utils";
import { chatTG } from "./chatTG.models";

export const chatAdminsTG = sqliteTable(
  "chat_admins_tg",
  {
    chatId: int("chat_id")
      .notNull()
      .references(() => chatTG.id),
    adminChatId: text("admin_chat_id").notNull(),
    name: text("name"),
    isActive: int("is_active").notNull().default(1),
    ...timestamps,
  },
  table => [primaryKey({ columns: [table.chatId, table.adminChatId] })],
);

export const getAllChatMainAdmins = async (
  args: Partial<typeof chatAdminsTG.$inferSelect>,
  options: DrizzleOptions = {},
  ...where: (SQLWrapper | undefined)[]
) => {
  return getAll(chatAdminsTG, options)(args, ...where);
};

export const addMainAdminToChat = async (
  args: { chatId: number; adminChatId: string; name: string },
  options: DrizzleOptions = {},
) => {
  const { chatId, adminChatId, name } = args;
  const { ctx = drizzle } = options;
  return ctx
    .insert(chatAdminsTG)
    .values({
      chatId,
      adminChatId,
      name,
      isActive: 1,
    })
    .onConflictDoUpdate({
      target: [chatAdminsTG.chatId, chatAdminsTG.adminChatId],
      set: {
        name,
        isActive: 1,
      },
    });
};

export const removeMainAdminFromChat = async (
  chatId: number,
  adminChatId: string,
) => {
  return drizzle
    .update(chatAdminsTG)
    .set({
      isActive: 0,
    })
    .where(
      and(
        eq(chatAdminsTG.chatId, chatId),
        eq(chatAdminsTG.adminChatId, adminChatId),
      ),
    );
};

export const getMainAdminsForChat = async (chatId: number) => {
  return drizzle
    .select()
    .from(chatAdminsTG)
    .where(and(eq(chatAdminsTG.chatId, chatId), eq(chatAdminsTG.isActive, 1)));
};
