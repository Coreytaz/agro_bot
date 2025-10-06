import {
  expireUserBan,
  getActiveChatBan,
  getActiveUserBan,
} from "@core/db/models";
import logger from "@core/utils/logger";
import type { NextFunction } from "grammy";

import type { Context } from "../interface/Context";
import { LoggerBot } from "../utils";

const checkAndExpireBan = async (ban: any) => {
  if (!ban.expiresAt) return false;

  const expiresAt = new Date(ban.expiresAt);
  const now = new Date();

  if (now >= expiresAt) {
    await expireUserBan(ban.id);
    logger.info(
      `Временный бан ${ban.targetType} ${ban.targetId} в чате ${ban.chatId} автоматически снят по истечении срока`,
    );
    return true;
  }

  return false;
};

export default async function blockCheck(ctx: Context, next: NextFunction) {
  try {
    const chatBan = await getActiveChatBan(ctx.chatDB.chatId);

    if (chatBan) {
      const banExpired = await checkAndExpireBan(chatBan);

      if (!banExpired) {
        logger.info(
          `Заблокированный чат ${ctx.chatDB.chatId} пытается получить доступ к боту`,
        );

        let banMessage = await ctx.t("blocking.blocked.message");

        if (chatBan.reason) {
          banMessage += chatBan.reason;
        }

        await ctx.reply(banMessage);
        throw new LoggerBot(banMessage, {
          ctx,
          datapath: "permissions.accessDenied.banned",
        });
      }
    }

    if (ctx.from?.id) {
      const userId = String(ctx.from.id);
      const chatId = ctx.chatDB.chatId;

      const activeBan = await getActiveUserBan(userId, chatId);

      if (activeBan) {
        const banExpired = await checkAndExpireBan(activeBan);

        if (!banExpired) {
          let banMessage = "Вы забанены администратором";

          if (activeBan.reason) {
            banMessage += `\nПричина: ${activeBan.reason}`;
          }

          if (activeBan.expiresAt) {
            const expiresAt = new Date(activeBan.expiresAt);
            banMessage += `\nБан истечет: ${expiresAt.toLocaleString("ru-RU")}`;
          } else {
            banMessage += "\nБан постоянный";
          }

          logger.info(
            `Заблокированный пользователь ${userId} в чате ${chatId} пытается получить доступ к боту`,
          );

          await ctx.reply(banMessage);
          throw new LoggerBot(banMessage, {
            ctx,
            datapath: "permissions.accessDenied.banned",
          });
        }
      }
    }

    await next();
  } catch (error) {
    if (error instanceof LoggerBot) {
      logger.error(error.message);
    }
  }
}
