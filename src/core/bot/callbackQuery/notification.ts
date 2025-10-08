import { LOCALIZATION_KEYS } from "@config/localization.config";
import { drizzle } from "@core/db";
import {
  createOneChatSettings,
  getChatSettingsByChatTgId,
  updateOneChatSettings,
} from "@core/db/models";
import logger from "@core/utils/logger";
import { InlineKeyboard } from "grammy";

import type { Context } from "../core/interface/Context";
import settings from "./settings";

const SETTINGS_NOTIFICATION_KEY = "settings.notification";
const SETTINGS_NOTIFICATION_BACK_KEY = "settings.back";

interface Params {
  toggle?: "0" | "1";
}

async function settingsNotification(ctx: Context) {
  const params = ctx.paramsExtractor?.params as Params;
  const toggle = params.toggle;

  try {
    if (toggle !== undefined) {
      const newNotificationState = toggle === "1" ? 1 : 0;

      await drizzle.transaction(async tx => {
        let chatSettings = await getChatSettingsByChatTgId(ctx.chatDB.id);

        chatSettings ??= await createOneChatSettings(
          { chatTgId: ctx.chatDB.id },
          { ctx: tx },
        );

        await updateOneChatSettings(
          { notifications: newNotificationState },
          { id: chatSettings.id },
          { ctx: tx },
        );
      });

      const statusTranslation = await ctx.tm([
        newNotificationState === 1
          ? LOCALIZATION_KEYS.SETTINGS_NOTIFICATIONS_ENABLED
          : LOCALIZATION_KEYS.SETTINGS_NOTIFICATIONS_DISABLED,
      ]);

      const statusMessage =
        statusTranslation[
          newNotificationState === 1
            ? LOCALIZATION_KEYS.SETTINGS_NOTIFICATIONS_ENABLED
            : LOCALIZATION_KEYS.SETTINGS_NOTIFICATIONS_DISABLED
        ];

      await ctx.answerCallbackQuery(statusMessage);
    }
  } catch (error) {
    if (error instanceof Error) {
      await ctx.answerCallbackQuery("❌ Произошла ошибка");
      logger.error("Notification toggle error:", error);
    }
  }

  const chatSettings = await getChatSettingsByChatTgId(ctx.chatDB.id);
  const currentNotificationState = chatSettings?.notifications ?? 1;

  const translate = await ctx.tm([
    LOCALIZATION_KEYS.SETTINGS_NOTIFICATIONS,
    LOCALIZATION_KEYS.SETTINGS_NOTIFICATIONS_ON,
    LOCALIZATION_KEYS.SETTINGS_NOTIFICATIONS_OFF,
    LOCALIZATION_KEYS.SETTINGS_NOTIFICATIONS_ENABLED,
    LOCALIZATION_KEYS.SETTINGS_NOTIFICATIONS_DISABLED,
    LOCALIZATION_KEYS.BUTTON_BACK,
  ]);

  try {
    const enableText =
      currentNotificationState === 1
        ? translate[LOCALIZATION_KEYS.SETTINGS_NOTIFICATIONS_OFF]
        : translate[LOCALIZATION_KEYS.SETTINGS_NOTIFICATIONS_ON];

    const keyboard = new InlineKeyboard()
      .text(
        enableText,
        currentNotificationState === 1
          ? `${SETTINGS_NOTIFICATION_KEY}{toggle:0}`
          : `${SETTINGS_NOTIFICATION_KEY}{toggle:1}`,
      )
      .row()
      .text(
        translate[LOCALIZATION_KEYS.BUTTON_BACK],
        SETTINGS_NOTIFICATION_BACK_KEY,
      );

    const statusText =
      currentNotificationState === 1
        ? translate[LOCALIZATION_KEYS.SETTINGS_NOTIFICATIONS_ENABLED]
        : translate[LOCALIZATION_KEYS.SETTINGS_NOTIFICATIONS_DISABLED];

    await ctx.editAndReply.reply(
      `${translate[LOCALIZATION_KEYS.SETTINGS_NOTIFICATIONS]}\n\n${statusText}`,
      { reply_markup: keyboard },
    );
  } catch (error) {
    if (error instanceof Error) {
      logger.error("Notification menu error:", error.message);
    }
  }
}

export default {
  [SETTINGS_NOTIFICATION_KEY]: settingsNotification,
  [SETTINGS_NOTIFICATION_BACK_KEY]: settings,
};
