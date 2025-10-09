import { getCronManager } from "@core/bot";
import { bot } from "@core/bot/core";
import { sendBroadcast } from "@core/cron";

import type { IBroadcast, IUpdateBroadcast } from "../interface";
import { getBroadcastById, updateBroadcast } from "../models/broadcast.models";

export const COMMON_CRON_EXPRESSIONS = {
  DAILY_9AM: "0 9 * * *",
  WEEKLY_MONDAY_9AM: "0 9 * * 1",
} as const;

export const sendBroadcastNow = async (broadcastId: number): Promise<void> => {
  const broadcast = await getBroadcastById(broadcastId);

  if (!broadcast) {
    throw new Error(`Broadcast with id ${broadcastId} not found`);
  }

  try {
    await executeBroadcast(broadcast);
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

  const result = await sendBroadcast(bot, broadcast);

  if (!result.success) {
    throw new Error("Broadcast execution failed");
  }

  if (!broadcast.isRecurring) {
    await updateBroadcast(broadcast.id, {
      status: "sent",
      isScheduled: false,
    });
  }
};
