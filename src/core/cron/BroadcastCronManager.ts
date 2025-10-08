import { getAllChatTG } from "@core/db/models";
import logger from "@core/utils/logger";
import { CronJob } from "cron";
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
  maxConcurrentJobs?: number;
  enableLogging?: boolean;
}

export const getBroadcastStats = async (broadcastId: number) => {
  const broadcast = await getBroadcastById(broadcastId);
  if (!broadcast) {
    return null;
  }

  return {
    id: broadcast.id,
    title: broadcast.title,
    status: broadcast.status,
    totalUsers: broadcast.totalUsers ?? 0,
    sentCount: broadcast.sentCount ?? 0,
    errorCount: broadcast.errorCount ?? 0,
    createdAt: broadcast.created_at,
    sentAt: broadcast.sentAt,
  };
};

const sendBroadcast = async (
  bot: Bot,
  broadcastId: number,
): Promise<{ success: boolean; totalSent: number; errors: number }> => {
  try {
    // Получаем данные рассылки
    const broadcast = await getBroadcastById(broadcastId);
    if (!broadcast) {
      throw new Error(`Рассылка с ID ${broadcastId} не найдена`);
    }

    if (broadcast.status !== "draft") {
      throw new Error(
        `Рассылка уже отправлена или находится в процессе отправки`,
      );
    }

    // Устанавливаем статус "отправляется"
    await updateBroadcastStatus(broadcastId, "sending");

    // Получаем всех пользователей
    const users = await getAllChatTG({});
    const totalUsers = users.length;

    let sentCount = 0;
    let errorCount = 0;

    // Обновляем общее количество пользователей
    await updateBroadcastProgress(broadcastId, 0, 0, totalUsers);

    // Отправляем сообщения пользователям
    for (const user of users) {
      try {
        if (broadcast.imageUrl) {
          // Отправляем с изображением
          await bot.api.sendPhoto(user.chatId, broadcast.imageUrl, {
            caption: `${broadcast.title}\n\n${broadcast.message}`,
            parse_mode: "HTML",
          });
        } else {
          // Отправляем только текст
          await bot.api.sendMessage(
            user.chatId,
            `${broadcast.title}\n\n${broadcast.message}`,
            {
              parse_mode: "HTML",
            },
          );
        }

        sentCount++;

        // Периодически обновляем прогресс
        if (sentCount % 10 === 0) {
          await updateBroadcastProgress(broadcastId, sentCount, errorCount);
        }

        // Небольшая задержка между отправками для избежания rate limiting
        await new Promise(resolve => setTimeout(resolve, 100));
      } catch (error: any) {
        // Если пользователь заблокировал бота, пропускаем его
        if (error?.error_code === 403) {
          errorCount++;
          continue;
        }
        errorCount++;
      }
    }

    // Обновляем финальный прогресс
    await updateBroadcastProgress(broadcastId, sentCount, errorCount);

    // Завершаем рассылку
    await completeBroadcast(broadcastId);

    return {
      success: true,
      totalSent: sentCount,
      errors: errorCount,
    };
  } catch {
    // Устанавливаем статус ошибки
    await updateBroadcastStatus(broadcastId, "error");

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
      maxConcurrentJobs: config.maxConcurrentJobs ?? 10,
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
        if (broadcast.cronExpression) {
          await this.scheduleJob(broadcast);
        }
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
        nextRunAt: this.getNextRunTime(cronExpression),
      });

      // Получаем обновленную рассылку
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
        nextRunAt: undefined,
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

  private async scheduleJob(
    _broadcast: typeof broadcast.$inferSelect,
  ): Promise<void> {
    if (!_broadcast.cronExpression) {
      return;
    }

    try {
      const job = new CronJob(
        _broadcast.cronExpression,
        async () => {
          await this.executeBroadcast(_broadcast.id);
        },
        null,
        false,
        this.config.timezone,
      );

      // Останавливаем существующую задачу если есть
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
      const broadcast = await getBroadcastById(broadcastId);
      if (!broadcast) {
        logger.error(`Broadcast ${broadcastId} not found during execution`);
        return;
      }

      if (this.config.enableLogging) {
        logger.info(`Executing scheduled broadcast ${broadcastId}`);
      }

      // Обновляем статус на "sending"
      await updateBroadcast(broadcastId, {
        status: "sending",
        lastRunAt: new Date().toISOString(),
      });

      const result = await sendBroadcast(this.bot, broadcastId);

      if (result.success) {
        if (!broadcast.isRecurring) {
          await updateBroadcast(broadcastId, {
            status: "sent",
            isScheduled: false,
          });

          // Удаляем задачу
          const job = this.jobs.get(broadcastId);
          if (job) {
            await job.stop();
            this.jobs.delete(broadcastId);
          }
        } else {
          // Для повторяющихся рассылок обновляем nextRunAt
          const nextRunTime = broadcast.cronExpression
            ? this.getNextRunTime(broadcast.cronExpression)
            : undefined;

          await updateBroadcast(broadcastId, {
            status: "scheduled",
            nextRunAt: nextRunTime,
          });
        }

        if (this.config.enableLogging) {
          logger.info(
            `Broadcast ${broadcastId} executed successfully. Sent: ${result.totalSent}, Errors: ${result.errors}`,
          );
        }
      } else {
        await updateBroadcast(broadcastId, { status: "error" });
        logger.error(`Failed to execute broadcast ${broadcastId}`);
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
        () => {
          /* empty */
        },
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
