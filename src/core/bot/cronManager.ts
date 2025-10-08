import logger from "@core/utils/logger";

import { BroadcastCronManager } from "../cron/BroadcastCronManager";
import bot from "./core/core";

let cronManager: BroadcastCronManager | null = null;

export async function initializeCronManager(): Promise<void> {
  try {
    if (cronManager) {
      logger.warn("Cron Manager already initialized");
      return;
    }

    cronManager = new BroadcastCronManager(bot, {
      timezone: "Europe/Moscow",
      enableLogging: true,
      maxConcurrentJobs: 10,
    });

    await cronManager.start();
    logger.info("Broadcast Cron Manager initialized successfully");
  } catch (error) {
    logger.error("Failed to initialize Cron Manager:", error);
    throw error;
  }
}

export function stopCronManager(): void {
  try {
    if (!cronManager) {
      logger.warn("Cron Manager not initialized");
      return;
    }

    cronManager.stop();
    cronManager = null;
    logger.info("Broadcast Cron Manager stopped successfully");
  } catch (error) {
    logger.error("Failed to stop Cron Manager:", error);
    throw error;
  }
}

export function getCronManager(): BroadcastCronManager | null {
  return cronManager;
}
