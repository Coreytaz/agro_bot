import type { Command } from "@grammyjs/commands";

import { Context } from "../interface/Context";

export interface GenerateMyCommandsOptions<T extends string = string> {
  /**
   * Список разрешённых команд (например, ["/menu"])
   */
  allow?: T[];
  /**
   * Список команд, которые нужно исключить
   */
  exclude?: T[];
}

export function generateMyCommands<T extends string = string>(
  commands: Record<T, Command<Context>>,
  options?: GenerateMyCommandsOptions<T>,
): { command: string; description: string }[] {
  let entries = Object.entries(commands) as [T, Command][];

  if (options?.allow) {
    entries = entries.filter(
      ([cmd]) => Array.isArray(options.allow) && options.allow.includes(cmd),
    );
  }
  if (options?.exclude) {
    entries = entries.filter(
      ([cmd]) =>
        !Array.isArray(options.exclude) || !options.exclude.includes(cmd),
    );
  }

  return entries.map(([, handler]) => ({
    command: handler.stringName,
    description: handler.description,
  }));
}
