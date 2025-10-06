import { Command } from "@grammyjs/commands";

import { Context } from "../core/interface/Context";
import adminCommand from "./admin";
import blocking from "./blocking";
import cancelCommand from "./cancel";
import menuCommand from "./menu";
import settingsCommand from "./settings";

const commands: Record<string, Command<Context>> = {
  "/menu": menuCommand,
  "/settings": settingsCommand,
  "/cancel": cancelCommand,
  "/admin": adminCommand,
  ...blocking,
} as const;

export default commands;
