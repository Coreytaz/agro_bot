import { LocalizationKey } from "@core/db/interface";
import { updateOneLocalization } from "@core/db/models";
import logger from "@core/utils/logger";
import { BotError, type NextFunction } from "grammy";

import { ADMIN_CONTENT_EDIT_WAIT_KEY } from "../callbackQuery/admin-content";
import type { Context } from "../core/interface/Context";
import { LoggerBot } from "../core/utils";

interface DataSession {
  id?: number;
  locale?: string;
  key?: LocalizationKey;
}

async function adminContentEditWait(ctx: Context, next: NextFunction) {
  try {
    const value = ctx.message?.text?.trim();
    if (!value) {
      await ctx.editAndReply.reply(
        "Необходимо отправить текстовое сообщение\n/cancel — отменить действие",
      );
      return;
    }

    const data: DataSession = ctx.session?.data ?? {};
    const id = data.id;
    const locale = data.locale;
    const key = data.key;

    await ctx.sessionClear?.();

    if (!id || Number.isNaN(id) || !locale || !key) {
      const msg =
        "Не удалось определить элемент для редактирования действия отменено автоматически";
      await ctx.editAndReply.reply(msg);
      throw new LoggerBot(
        `${msg}\n ID: ${id}, Locale: ${locale}, Key: ${key}`,
        { ctx },
      );
    }

    await updateOneLocalization({ value }, { id, key });

    await ctx.editAndReply.reply(`Значение обновлено: ${value}`);
    await next();
  } catch (error) {
    if (error instanceof BotError) {
      logger.error(error.message);
    }
  }
}

export default {
  [ADMIN_CONTENT_EDIT_WAIT_KEY]: adminContentEditWait,
};
