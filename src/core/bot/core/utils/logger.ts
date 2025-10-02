import config from "@config/config";
import { KeyLogger } from "@core/db/config";
import { drizzle } from "@core/db/drizzle";
import {
  chatAdminsTG,
  filterChatIdsByDatapath,
  getAllChatMainAdmins,
  getAllChatTG,
  getOneRole,
  RoleType,
} from "@core/db/models";
import logger from "@core/utils/logger";
import { FormattedString } from "@grammyjs/parse-mode";
import { inArray } from "drizzle-orm";

import bot from "../core";
import { Context } from "../interface/Context";
import { TypeLogger } from "../interface/Logger";
import { createMsg } from "./createMsg";

type Other = Parameters<Context["api"]["sendMessage"]>[2];

class LoggerTG {
  public async message(
    type: TypeLogger,
    message: string | FormattedString,
    datapath?: KeyLogger,
    _other?: Other,
  ) {
    try {
      const adminChatIds: string[] = await drizzle.transaction(async tx => {
        const adminRole = await getOneRole(
          { name: RoleType.admin },
          { ctx: tx },
        );

        if (!adminRole) {
          logger.warn(
            "Role 'admin' not found. Skipping Telegram logging to admins.",
          );
          return [];
        }

        const chats = await getAllChatTG({ roleId: adminRole.id }, { ctx: tx });

        if (!(chats.length > 0)) return [];

        const chatIds = chats.map(c => c.id);

        const admins = await getAllChatMainAdmins(
          { isActive: 1 },
          { ctx: tx },
          inArray(chatAdminsTG.chatId, chatIds),
        );

        if (!(admins.length > 0)) return [];

        let adminsIds = Array.from(new Set(admins.map(a => a.adminChatId)));

        if (datapath) {
          adminsIds = await filterChatIdsByDatapath(adminsIds, datapath, {
            ctx: tx,
          });
        }

        return adminsIds;
      });

      if (!(adminChatIds.length > 0)) return;

      const fmtMessage = createMsg(type, message);

      for (const adminChatId of adminChatIds) {
        await bot.api.sendMessage(adminChatId, fmtMessage.text, {
          entities: fmtMessage.entities,
          ..._other,
        });
      }
    } catch (error) {
      logger.error(error);
    }
  }

  public async debug(message: string | FormattedString, other?: Other) {
    if (config.isDev) {
      await this.message("debug", message, undefined, other);
    }
  }

  public async info(message: string | FormattedString, other?: Other) {
    await this.message("info", message, undefined, other);
  }

  public async error(message: string | FormattedString, other?: Other) {
    await this.message("error", message, undefined, other);
  }
}

export const loggerTG = new LoggerTG();
