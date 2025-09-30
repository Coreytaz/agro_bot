import logger from "@core/utils/logger";
import { commands } from "@grammyjs/commands";
import { run, RunnerHandle } from "@grammyjs/runner";
import { ignoreOld, sequentialize } from "grammy-middlewares";

import { bot } from "./core";
import {
  editAndReply,
  getType,
  identify,
  permissionsCheck,
  router,
  typeCheck,
  userCheck,
} from "./core/middlewares";

let runner: RunnerHandle;

async function runBot() {
  logger.info("Запуск бота...");

  bot
    .use(sequentialize())
    .use(ignoreOld(5 * 60 * 24))
    .use(commands())

    .use(getType)
    .use(userCheck)
    .use(typeCheck)
    .use(permissionsCheck)
    .use(editAndReply)
    .use(identify)
    .use(router);

  await bot.init();
  runner = run(bot);
  logger.info(`Бот ${bot.botInfo.username} запущен и работает`);
}

async function stopBot() {
  logger.info("Остановка бота...");
  if (runner.isRunning()) {
    await bot.stop();
  }
  logger.info("Бот остановлен");
}

export { runBot, stopBot };
