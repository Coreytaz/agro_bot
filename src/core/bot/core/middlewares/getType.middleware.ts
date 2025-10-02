import { getOneTypeByName } from "@core/db/models";
import logger from "@core/utils/logger";
import { NextFunction } from "grammy";

import { Context } from "../interface/Context";
import { LoggerBot } from "../utils";

const mapLang = {
  private: "Приватный чат",
  group: "Группа",
  supergroup: "Супергруппа",
  channel: "Канал",
};

export default async function getType(ctx: Context, next: NextFunction) {
  try {
    const chatType = ctx.chat?.type;

    if (!chatType)
      throw new LoggerBot("Не удалось определить тип чата", {
        ctx,
        datapath: "bot.middleware.getType",
      });

    const config = await getOneTypeByName(chatType);

    if (!config)
      throw new LoggerBot(
        `Тип чата "${mapLang[chatType]}" не настроен в боте`,
        { ctx, datapath: "bot.middleware.getTypeDisabled" },
      );

    ctx.chatType = config;
    await next();
  } catch (error) {
    if (error instanceof LoggerBot) {
      logger.error(error.message);
    }
    return;
  }
}
