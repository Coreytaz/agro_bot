import { Command } from "@grammyjs/commands";

import { Context } from "../core/interface/Context";
import aboutCommand from "./about";
import adminCommand from "./admin";
import blocking from "./blocking";
import broadcastCommand from "./broadcast";
import cancelCommand from "./cancel";
import helpCommand from "./help";
import menuCommand from "./menu";
import settingsCommand from "./settings";
import startCommand from "./start";

const commands: Record<string, Command<Context>> = {
  "/start": startCommand,
  "/help": helpCommand,
  "/menu": menuCommand,
  "/about": aboutCommand,
  "/settings": settingsCommand,
  "/cancel": cancelCommand,
  "/admin": adminCommand,
  "/broadcast": broadcastCommand,
  ...blocking,
} as const;

export default commands;
