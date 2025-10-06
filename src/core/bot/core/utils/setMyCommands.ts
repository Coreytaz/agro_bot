import { Bot } from "grammy";

import commands from "../../commands";
import { Context } from "../interface/Context";
import type { GenerateMyCommandsOptions } from "./generateMyCommands";
import { generateMyCommands } from "./generateMyCommands";

export async function setMyCommands<
  T extends keyof typeof commands = keyof typeof commands,
>(bot: Bot<Context>, options?: GenerateMyCommandsOptions<T>) {
  await bot.api.setMyCommands(generateMyCommands(commands, options));
}
