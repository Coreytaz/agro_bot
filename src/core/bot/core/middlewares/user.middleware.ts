import { localizationConfig } from "@config/localization.config";
import { drizzle } from "@core/db";
import {
  addMainAdminToChat,
  chatTG,
  createDefaultChatSettings,
  getOneRole,
  role as _role,
  RoleType,
} from "@core/db/models";
import { isEmpty } from "@core/utils/isEmpty";
import logger from "@core/utils/logger";
import { eq } from "drizzle-orm";
import { NextFunction } from "grammy";

import { Context } from "../interface/Context";
import { LoggerBot } from "../utils";

export default async function userCheck(ctx: Context, next: NextFunction) {
  try {
    if (!ctx.chatId)
      throw new LoggerBot("Не удалось определить чат!", {
        ctx,
        datapath: "bot.middleware.userCheck",
      });

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
          throw new LoggerBot("Роль гостя не найдена в базе!", {
            ctx,
            datapath: "bot.middleware.emptyRole",
          });

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

        const userLocale =
          ctx.from?.language_code ?? localizationConfig.defaultLocale;
        const normalizedLocale = userLocale.split("-").at(0) ?? "";
        const chatLocale = ["ru", "en"].includes(normalizedLocale)
          ? normalizedLocale
          : localizationConfig.defaultLocale;

        await createDefaultChatSettings(newChat.id, chatLocale, { ctx: tx });

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
    if (error instanceof LoggerBot) {
      logger.error(error.message);
    }
  }
}
