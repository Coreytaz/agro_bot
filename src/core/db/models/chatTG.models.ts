import type { SQLWrapper } from "drizzle-orm";
import { int, sqliteTable, text } from "drizzle-orm/sqlite-core";

import {
  findAndCountAll,
  getAll,
  getOne,
  timestamps,
  updateOne,
} from "../utils";
import { getMainAdminsForChat } from "./chatAdminsTG.models";
import { role } from "./role.models";
import { typeTG } from "./typeTG.models";

export const chatTG = sqliteTable("chat_tg", {
  id: int().primaryKey({ autoIncrement: true }),
  chatId: text().notNull().unique(),
  name: text().notNull(),
  typeId: int()
    .notNull()
    .references(() => typeTG.id),
  roleId: int()
    .notNull()
    .references(() => role.id),
  ...timestamps,
});

export const findAndCountAllChatTG = async <T extends typeof chatTG>(
  args: Partial<T["$inferSelect"]>,
  options: { limit: number; offset: number },
  ...where: (SQLWrapper | undefined)[]
) => {
  return findAndCountAll(chatTG)(args, options, ...where);
};

export const getOneChatTG = async <T extends typeof chatTG>(
  args: Partial<T["$inferSelect"]>,
  ...where: (SQLWrapper | undefined)[]
) => {
  return getOne(chatTG)(args, ...where);
};

export const updateOneChatTG = async <T extends typeof chatTG>(
  args: Partial<T["$inferSelect"]>,
  where?: Partial<T["$inferSelect"]>,
  ...rest: (SQLWrapper | undefined)[]
) => {
  return updateOne(chatTG)(args, where, ...rest);
};

export const getAllChatTg = async <T extends typeof chatTG>(
  args: Partial<T["$inferSelect"]>,
  ...rest: (SQLWrapper | undefined)[]
) => {
  return getAll(chatTG)(args, ...rest);
};

export const getChatWithMainAdmin = async (chatId: string) => {
  const chatInfo = await getOneChatTG({ chatId });
  if (!chatInfo) {
    return null;
  }

  const mainAdmins = await getMainAdminsForChat(chatInfo.id);

  return {
    ...chatInfo,
    mainAdmins,
  };
};
