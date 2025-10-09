import { and, eq, SQLWrapper } from "drizzle-orm";
import { int, sqliteTable, text } from "drizzle-orm/sqlite-core";

import { drizzle } from "../drizzle";
import { DrizzleOptions } from "../types";
import { createOne, getOne, updateOne } from "../utils";
import { timestamps } from "../utils/timestamps.helpers";
import { chatTG } from "./chatTG.models";

export const CONTENT_TYPES = ["text", "photo", "video", "document", "audio", "voice", "animation", "mediaGroup"] as const;
export type ContentType = typeof CONTENT_TYPES[number];

export const chatReplyTG = sqliteTable("chat_reply_tg", {
  id: int().primaryKey({ autoIncrement: true }),
  messageId: int("message_id").notNull().unique(),
  chatId: text("chat_id")
    .notNull()
    .references(() => chatTG.chatId, { onDelete: "cascade" }),
  contentType: text("content_type", { 
    enum: CONTENT_TYPES 
  }),
  ...timestamps,
});

export const getOneChatReply = async (
  args: Partial<typeof chatReplyTG.$inferSelect>,
  options: DrizzleOptions = {},
) => {
  const { ctx } = options;
  return getOne(chatReplyTG, { ctx })(args);
};

export const findOneChatReply = async (
  args: Partial<Omit<typeof chatReplyTG.$inferSelect, keyof typeof timestamps>>,
) => {
  const conditions = Object.entries(args)
    .filter(([, value]) => value != null)
    .map(([key, value]) =>
      eq(chatReplyTG[key as keyof typeof chatReplyTG.$inferSelect], value as any),
    );

  if (conditions.length === 0) {
    return null;
  }

  return drizzle
    .select()
    .from(chatReplyTG)
    .where(and(...conditions))
    .get();
};

export const updateOneChatReply = async <T extends typeof chatReplyTG>(
  args: Partial<T["$inferSelect"]>,
  where?: Partial<T["$inferSelect"]>,
  options: DrizzleOptions = {},
  ...rest: (SQLWrapper | undefined)[]
) => {
  return updateOne(chatReplyTG, options)(args, where, ...rest);
};

export const createOneChatReply = async (
  args: (typeof chatReplyTG)["$inferInsert"],
  options: DrizzleOptions = {},
) => {
  return createOne(chatReplyTG, options)(args);
};
