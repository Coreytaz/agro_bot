import { getCronManager } from "@core/bot";
import logger from "@core/utils/logger";

import type { IBroadcast, IUpdateBroadcast } from "../interface";
import { getBroadcastById, updateBroadcast } from "../models/broadcast.models";
import { getAllChatTG } from "../models/chatTG.models";

export const COMMON_CRON_EXPRESSIONS = {
  DAILY_9AM: "0 9 * * *",
  DAILY_6PM: "0 18 * * *",
  WEEKLY_MONDAY_9AM: "0 9 * * 1",
  WEEKLY_FRIDAY_6PM: "0 18 * * 5",
} as const;

export const sendBroadcastNow = async (broadcastId: number): Promise<void> => {
  const broadcast = await getBroadcastById(broadcastId);
  if (!broadcast) {
    throw new Error(`Broadcast with id ${broadcastId} not found`);
  }

  await updateBroadcast(broadcastId, {
    status: "sending",
    sentAt: new Date().toISOString(),
  });

  try {
    await executeBroadcast(broadcast);
    await updateBroadcast(broadcastId, { status: "sent" });
  } catch (error) {
    await updateBroadcast(broadcastId, { status: "error" });
    throw error;
  }
};

export const scheduleBroadcast = async (
  broadcastId: number,
  cronExpression: string,
  isRecurring = false,
): Promise<void> => {
  const updateData: IUpdateBroadcast = {
    cronExpression,
    isScheduled: true,
    isRecurring,
  };

  await updateBroadcast(broadcastId, updateData);
};

export const executeBroadcast = async (
  broadcast: IBroadcast,
): Promise<void> => {
  const cronManager = getCronManager();

  if (!cronManager) {
    throw new Error("Cron Manager not available");
  }

  const bot = (cronManager as any).bot;

  if (!bot) {
    throw new Error("Bot instance not available");
  }

  const chats = await getAllChatTG({});

  for (const chat of chats) {
    try {
      if (broadcast.imageUrl) {
        await bot.api.sendPhoto(chat.chatId, broadcast.imageUrl, {
          caption: broadcast.message,
          parse_mode: "Markdown",
        });
      } else {
        await bot.api.sendMessage(chat.chatId, broadcast.message, {
          parse_mode: "Markdown",
        });
      }
    } catch (error) {
      logger.error(`Failed to send broadcast to chat ${chat.chatId}:`, error);
    }
  }
};
