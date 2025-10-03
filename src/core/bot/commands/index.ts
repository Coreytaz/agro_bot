import type { Command } from "@grammyjs/commands";

import menuCommand from "./menu";
import settingsCommand from "./settings";

const commands = {
  "/menu": menuCommand,
  "/settings": settingsCommand,
} as unknown as Record<string, Command>;

export default commands;
