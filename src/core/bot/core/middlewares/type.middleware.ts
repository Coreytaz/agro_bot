import { NextFunction } from "grammy";

import { Context } from "../interface/Context";
import { loggerTG } from "../utils";
import { createMsg } from "../utils/createMsg";

const mapLang = {
  private: "Приватный чат",
  group: "Группа",
  supergroup: "Супергруппа",
  channel: "Канал",
};

export default async function typeCheck(ctx: Context, next: NextFunction) {
  const config = ctx.chatType;

  if (!config.enable) {
    const m = `Бот отключен для типа чата "${mapLang[ctx.chatType.name]}"`;
    await loggerTG.info(m);
    const msg = createMsg("info", m);
    return ctx.reply(msg.text, { entities: msg.entities });
  }

  await next();
}
