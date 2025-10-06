import { KeyLogger } from "@core/db/config";
import logger from "@core/utils/logger";

import type { Context } from "../interface/Context";
import type { TypeLogger } from "../interface/Logger";
import { loggerTG } from "./logger";
import { parseObjectToHTML } from "./parseObjectToHTML";
import { separator } from "./separator";

interface LoggerBotOptions {
  ctx?: Context;
  type?: TypeLogger;
  datapath?: KeyLogger;
}

export class LoggerBot extends Error {
  constructor(description: string, options: LoggerBotOptions = {}) {
    super(description);
    const { ctx, type = "error", datapath } = options;

    if (ctx) {
      try {
        const error = parseObjectToHTML({
          users: {
            title: "Пользователь",
            value: `@${ctx.from?.username}`,
          },
          chatId: {
            title: "ЧатID",
            value: String(ctx.chatId),
            options: { spoiler: true },
          },
          chatType: { title: "Тип чата", value: ctx.chat?.type },
          chatName: { title: "Название чата", value: ctx.chat?.title },
          role: {
            title: "Роль",
            value: ctx.role.name,
            separator: () => `\n${separator}\n`,
          },
          description: {
            title: "Описание",
            value: description,
            separator: () => `\n${separator}\n`,
          },
          datapath: datapath
            ? {
                title: "Название лога",
                value: datapath,
                separator: () => `\n${separator}\n`,
              }
            : undefined,
          msg: ctx.message?.text
            ? {
                title: "Сообщение",
                value: ctx.message.text,
                separator: () => `\n${separator}\n`,
              }
            : undefined,
          btn: ctx.callbackQuery?.data
            ? {
                title: "Кнопка",
                value: ctx.callbackQuery.data,
                options: { pre: true },
                separator: () => `\n${separator}\n`,
              }
            : undefined,
        });
        void loggerTG.message(type, error, datapath);
      } catch (error) {
        logger.error(error);
      }
    }

    Object.setPrototypeOf(this, new.target.prototype);
    Error.captureStackTrace(this);
  }
}
