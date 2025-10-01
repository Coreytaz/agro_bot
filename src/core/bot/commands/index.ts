import type { Command } from "@grammyjs/commands";

import menuCommand from "./menu";

const commands = {
  "/menu": menuCommand,
} as unknown as Record<string, Command>;

export default commands;
