import { Context } from "@core/bot/core/interface/Context";
import { drizzle } from "@core/db";
import { IBroadcast } from "@core/db/interface";
import { chatSettings, chatTG, updateOneBroadcast } from "@core/db/models";
import logger from "@core/utils/logger";
import { CronJob } from "cron";
import { eq, isNull, or } from "drizzle-orm";
import { Bot } from "grammy";

import {
  broadcast,
  completeBroadcast,
  getAllBroadcasts,
  getBroadcastById,
  updateBroadcast,
  updateBroadcastProgress,
  updateBroadcastStatus,
} from "../db/models";

interface ICronManagerConfig {
  timezone?: string;
  enableLogging?: boolean;
}

export const sendBroadcast = async (
  bot: Bot<Context>,
  broadcast: IBroadcast,
): Promise<{ success: boolean; totalSent: number; errors: number }> => {
  try {
    await updateOneBroadcast({ status: "sending" }, { id: broadcast.id });

    const users = await drizzle.transaction(async tx => {
      const users = await tx
        .select({
          chatId: chatTG.chatId,
          name: chatTG.name,
        })
        .from(chatTG)
        .leftJoin(chatSettings, eq(chatSettings.chatTgId, chatTG.id))
        .where(
          or(
            eq(chatSettings.notifications, 1),
            isNull(chatSettings.notifications),
          ),
        )
        .all();

      return users;
    });

    const totalUsers = users.length;

    let sentCount = 0;
    let errorCount = 0;

    await updateBroadcastProgress(broadcast.id, 0, 0, totalUsers);

    for (const user of users) {
      try {
        const mediaItem = broadcast.media?.[0];

        switch (mediaItem?.type) {
          case "photo":
            await bot.api.sendPhoto(user.chatId, mediaItem.url, {
              caption: mediaItem.caption ?? broadcast.message,
              parse_mode: "Markdown",
            });
            break;
          case "video":
            await bot.api.sendVideo(user.chatId, mediaItem.url, {
              caption: mediaItem.caption ?? broadcast.message,
              parse_mode: "Markdown",
            });
            break;
          case "audio":
            await bot.api.sendAudio(user.chatId, mediaItem.url, {
              caption: mediaItem.caption ?? broadcast.message,
              parse_mode: "Markdown",
            });
            break;
          case "document":
            await bot.api.sendDocument(user.chatId, mediaItem.url, {
              caption: mediaItem.caption ?? broadcast.message,
              parse_mode: "Markdown",
            });
            break;
          case "voice":
            await bot.api.sendVoice(user.chatId, mediaItem.url, {
              caption: mediaItem.caption ?? broadcast.message,
              parse_mode: "Markdown",
            });
            break;
          case "video_note":
            await bot.api.sendVideoNote(user.chatId, mediaItem.url);
            break;
          case "animation":
            await bot.api.sendAnimation(user.chatId, mediaItem.url, {
              caption: mediaItem.caption ?? broadcast.message,
              parse_mode: "Markdown",
            });
            break;
          default:
            await bot.api.sendMessage(user.chatId, broadcast.message, {
              parse_mode: "Markdown",
            });
            break;
        }

        sentCount++;

        if (sentCount % 10 === 0) {
          await updateBroadcastProgress(broadcast.id, sentCount, errorCount);
        }

        await new Promise(resolve => setTimeout(resolve, 100));
      } catch (error: any) {
        if (error?.error_code === 403) {
          errorCount++;
          continue;
        }
        errorCount++;
      }
    }

    await updateBroadcastProgress(broadcast.id, sentCount, errorCount);

    await completeBroadcast(broadcast.id);

    return {
      success: true,
      totalSent: sentCount,
      errors: errorCount,
    };
  } catch {
    await updateBroadcastStatus(broadcast.id, "error");
    return {
      success: false,
      totalSent: 0,
      errors: 1,
    };
  }
};

export class BroadcastCronManager {
  private jobs = new Map<number, CronJob>();
  private bot: Bot<any>;
  private config: ICronManagerConfig;
  private isRunning = false;

  constructor(bot: Bot<any>, config: ICronManagerConfig = {}) {
    this.bot = bot;
    this.config = {
      timezone: config.timezone ?? "Europe/Moscow",
      enableLogging: config.enableLogging ?? true,
      ...config,
    };
  }

  async start(): Promise<void> {
    if (this.isRunning) {
      logger.warn("Broadcast Cron Manager already running");
      return;
    }

    this.isRunning = true;
    await this.loadScheduledBroadcasts();

    if (this.config.enableLogging) {
      logger.info("Broadcast Cron Manager started");
    }
  }

  stop(): void {
    if (!this.isRunning) {
      return;
    }

    this.jobs.forEach(job => {
      void job.stop();
    });
    this.jobs.clear();
    this.isRunning = false;

    if (this.config.enableLogging) {
      logger.info("Broadcast Cron Manager stopped");
    }
  }

  private async loadScheduledBroadcasts(): Promise<void> {
    try {
      const scheduledBroadcasts = await getAllBroadcasts();

      const filteredBroadcasts = scheduledBroadcasts.filter(
        broadcast => broadcast.status === "scheduled" && broadcast.isScheduled,
      );

      for (const broadcast of filteredBroadcasts) {
        await this.scheduleJob(broadcast);
      }

      if (this.config.enableLogging) {
        logger.info(`Loaded ${filteredBroadcasts.length} scheduled broadcasts`);
      }
    } catch (error) {
      logger.error("Error loading scheduled broadcasts:", error);
    }
  }

  async scheduleBroadcast(
    broadcastId: number,
    cronExpression: string,
    isRecurring = false,
  ): Promise<boolean> {
    try {
      const broadcast = await getBroadcastById(broadcastId);
      if (!broadcast) {
        logger.error(`Broadcast with ID ${broadcastId} not found`);
        return false;
      }

      await updateBroadcast(broadcastId, {
        cronExpression,
        isScheduled: true,
        isRecurring,
        status: "scheduled",
      });

      const updatedBroadcast = await getBroadcastById(broadcastId);
      if (updatedBroadcast) {
        await this.scheduleJob(updatedBroadcast);
      }

      if (this.config.enableLogging) {
        logger.info(
          `Scheduled broadcast ${broadcastId} with cron: ${cronExpression}`,
        );
      }

      return true;
    } catch (error) {
      logger.error(`Error scheduling broadcast ${broadcastId}:`, error);
      return false;
    }
  }

  async cancelScheduledBroadcast(broadcastId: number): Promise<boolean> {
    try {
      const job = this.jobs.get(broadcastId);
      if (job) {
        void job.stop();
        this.jobs.delete(broadcastId);
      }

      await updateBroadcast(broadcastId, {
        isScheduled: false,
        status: "draft",
        cronExpression: undefined,
      });

      if (this.config.enableLogging) {
        logger.info(`Cancelled scheduled broadcast ${broadcastId}`);
      }

      return true;
    } catch (error) {
      logger.error(
        `Error cancelling scheduled broadcast ${broadcastId}:`,
        error,
      );
      return false;
    }
  }

  async scheduleJob(_broadcast: typeof broadcast.$inferSelect): Promise<void> {
    if (!_broadcast.cronExpression) {
      return;
    }

    try {
      const job = new CronJob(
        _broadcast.cronExpression,
        () => this.executeBroadcast(_broadcast.id),
        null,
        false,
        this.config.timezone,
      );

      const existingJob = this.jobs.get(_broadcast.id);

      if (existingJob) {
        await existingJob.stop();
      }

      this.jobs.set(_broadcast.id, job);
      job.start();

      if (this.config.enableLogging) {
        logger.info(`Created cron job for broadcast ${_broadcast.id}`);
      }
    } catch (error) {
      logger.error(
        `Error creating cron job for broadcast ${_broadcast.id}:`,
        error,
      );
    }
  }

  private async executeBroadcast(broadcastId: number): Promise<void> {
    try {
      if (this.config.enableLogging) {
        logger.info(`Executing scheduled broadcast ${broadcastId}`);
      }

      const broadcast = await updateBroadcast(broadcastId, {
        status: "sending",
      });

      if (!broadcast) {
        logger.error(`Broadcast ${broadcastId} not found during execution`);
        return;
      }

      const result = await sendBroadcast(this.bot, broadcast);

      if (!result.success) {
        throw new Error("Broadcast execution failed");
      }

      if (!broadcast.isRecurring) {
        await updateBroadcast(broadcastId, {
          status: "sent",
          isScheduled: false,
        });

        const job = this.jobs.get(broadcastId);
        if (job) {
          await job.stop();
          this.jobs.delete(broadcastId);
        }
      } else {
        await updateBroadcast(broadcastId, {
          status: "scheduled",
        });
      }

      if (this.config.enableLogging) {
        logger.info(
          `Broadcast ${broadcastId} executed successfully. Sent: ${result.totalSent}, Errors: ${result.errors}`,
        );
      }
    } catch (error) {
      logger.error(`Error executing broadcast ${broadcastId}:`, error);
      await updateBroadcast(broadcastId, { status: "error" });
    }
  }

  private getNextRunTime(cronExpression: string): string {
    try {
      const job = new CronJob(
        cronExpression,
        // eslint-disable-next-line @typescript-eslint/no-empty-function
        () => {},
        null,
        false,
        this.config.timezone,
      );
      return job.nextDate().toJSDate().toISOString();
    } catch (error) {
      logger.error("Error calculating next run time:", error);
      return new Date().toISOString();
    }
  }

  getScheduledJobs(): { broadcastId: number; nextRun: Date | null }[] {
    const jobs: { broadcastId: number; nextRun: Date | null }[] = [];

    this.jobs.forEach((job, broadcastId) => {
      jobs.push({
        broadcastId,
        nextRun: job.nextDate().toJSDate(),
      });
    });

    return jobs;
  }

  static isValidCronExpression(cronExpression: string): boolean {
    try {
      new CronJob(cronExpression, () => {
        /* empty */
      });
      return true;
    } catch {
      return false;
    }
  }
}
