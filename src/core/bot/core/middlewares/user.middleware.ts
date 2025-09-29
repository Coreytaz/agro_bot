import { drizzle } from "@core/db";
import {
  addMainAdminToChat,
  chatTG,
  getOneRole,
  role as _role,
  RoleType,
} from "@core/db/models";
import { isEmpty } from "@core/utils/isEmpty";
import logger from "@core/utils/logger";
import { eq } from "drizzle-orm";
import { NextFunction } from "grammy";

import { Context } from "../interface/Context";
import { ErrorBot } from "../utils";

export default async function userCheck(ctx: Context, next: NextFunction) {
  try {
    if (!ctx.chatId)
      throw new ErrorBot("Не удалось определить чат!", ctx, true);

    const chat = await drizzle.transaction(async tx => {
      const existingChat = await tx
        .select({ chat: chatTG, role: _role })
        .from(chatTG)
        .where(eq(chatTG.chatId, String(ctx.chatId)))
        .leftJoin(_role, eq(_role.id, chatTG.roleId))
        .get();

      if (isEmpty(existingChat)) {
        const guestRole = await getOneRole(
          { name: RoleType.guest },
          { ctx: tx },
        );

        if (!guestRole)
          throw new ErrorBot("Роль гостя не найдена в базе!", ctx, true);

        const name =
          ctx.chat?.title ??
          ctx.chat?.username ??
          ctx.chat?.first_name ??
          "Без имени";

        const chatTg: typeof chatTG.$inferInsert = {
          name,
          typeId: ctx.chatType.id,
          chatId: String(ctx.chatId),
          roleId: guestRole.id,
        };

        const newChat = await tx
          .insert(chatTG)
          .values(chatTg)
          .returning()
          .get();

        if (ctx.chatType.name === "private") {
          await addMainAdminToChat(
            {
              chatId: newChat.id,
              adminChatId: String(ctx.from?.id),
              name,
            },
            { ctx: tx },
          );
        }

        return {
          chat: newChat,
          role: guestRole,
        };
      }

      return existingChat;
    });

    if (!chat?.chat || !chat.role)
      throw new Error("Chat not found in database!");

    ctx.chatDB = chat.chat;
    ctx.role = chat.role;

    await next();
    return;
  } catch (error) {
    if (error instanceof ErrorBot) {
      logger.error(error.message);
    }
  }
}
