import { getOneTypeByName } from "@core/db/models";
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

export default async function getType(ctx: Context, next: NextFunction) {
  try {
    const chatType = ctx.chat?.type;

    if (!chatType)
      throw new ErrorBot("Не удалось определить тип чата", ctx, true);

    const config = await getOneTypeByName(chatType);

    if (!config)
      throw new ErrorBot(
        `Тип чата "${mapLang[chatType]}" не настроен в боте`,
        ctx,
        true,
      );

    ctx.chatType = config;
    await next();
  } catch (error) {
    if (error instanceof ErrorBot) {
      logger.error(error.message);
    }
    return;
  }
}
