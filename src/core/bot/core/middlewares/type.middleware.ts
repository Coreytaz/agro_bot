import logger from "@core/utils/logger";
import { NextFunction } from "grammy";

import { Context } from "../interface/Context";
import { ErrorBot } from "../utils";

const mapLang = {
  private: "Приватный чат",
  group: "Группа",
  supergroup: "Супергруппа",
  channel: "Канал",
};

export default async function typeCheck(ctx: Context, next: NextFunction) {
  try {
    const config = ctx.chatType;

    if (!config.enable)
      throw new ErrorBot(
        `Бот отключен для типа чата "${mapLang[ctx.chatType.name]}"`,
        ctx,
        true,
      );

    await next();
  } catch (error) {
    if (error instanceof ErrorBot) {
      logger.error(error.message);
    }
    return;
  }
}
