import logger from "@core/utils/logger";
import { commands } from "@grammyjs/commands";
import { run, type RunnerHandle } from "@grammyjs/runner";
import { ignoreOld, sequentialize } from "grammy-middlewares";

import { bot } from "./core";
import {
  blockCheck,
  editAndReply,
  getType,
  identify,
  localization,
  permissionsCheck,
  router,
  session,
  typeCheck,
  userCheck,
} from "./core/middlewares";
import { setMyCommands } from "./core/utils";

let runner: RunnerHandle;

async function runBot() {
  logger.info("Запуск бота...");

  bot
    .use(sequentialize())
    .use(ignoreOld(5 * 60 * 24))
    .use(commands())

    .use(getType)
    .use(userCheck)
    .use(localization)
    .use(blockCheck)
    .use(typeCheck)
    .use(permissionsCheck)
    .use(editAndReply)
    .use(identify)
    .use(session)
    .use(router);

  await bot.init();

  await setMyCommands(bot, {
    allow: ["/start", "/menu", "/settings", "/cancel"],
  });

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
