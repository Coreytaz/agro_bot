import { Command } from "@grammyjs/commands";

import { Context } from "../core/interface/Context";
import adminCommand from "./admin";
import blocking from "./blocking";
import cancelCommand from "./cancel";
import menuCommand from "./menu";
import settingsCommand from "./settings";
import startCommand from "./start";

const commands: Record<string, Command<Context>> = {
  "/start": startCommand,
  "/help": startCommand, // help показывает то же сообщение, что и start
  "/menu": menuCommand,
  "/settings": settingsCommand,
  "/cancel": cancelCommand,
  "/admin": adminCommand,
  ...blocking,
} as const;

export default commands;
