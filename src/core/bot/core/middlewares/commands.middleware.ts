/* eslint-disable @typescript-eslint/no-unnecessary-condition */
import logger from "@core/utils/logger";
import type { Command } from "@grammyjs/commands";
import type { NextFunction } from "grammy";

import cmds from "../../commands";
import { Context } from "../interface/Context";
import { LoggerBot } from "../utils";

const myCommands = (cmds: Record<string, Command>) => {
  return Object.values(cmds).map(command => ({
    command: command.stringName,
    description: command.description,
  }));
};

const returnCommandHelper = async (
  command: string,
  ctx: Context,
  next: NextFunction,
) => {
  const commandFunc = cmds[command] ?? null;
  if (!commandFunc)
    throw new LoggerBot("Данной команды нету!", {
      ctx,
      datapath: "bot.commands",
    });
  await ctx.api.setMyCommands(myCommands(cmds));
  await commandFunc.middleware()(ctx, next);
};

const splitCommand = (ctx: Context) => {
  const text = ctx.message?.text ?? "";
  const parts = text.trim().split(/\s+/);
  const [command, usernameBot = ""] = parts[0].split("@");
  let referralLink = parts.slice(1).join(" ");
  if (referralLink.startsWith('"') && referralLink.endsWith('"')) {
    referralLink = referralLink.slice(1, -1);
  }

  ctx.usernameBot = usernameBot;
  ctx.referralLink = referralLink;

  return [command, usernameBot];
};

export default async function commands(ctx: Context, next: NextFunction) {
  try {
    logger.debug(`isCmd = ${ctx.isCmd}`);

    const [command, usernameBot] = splitCommand(ctx);

    if (usernameBot && usernameBot !== ctx.me.username)
      throw new LoggerBot("Команда не для этого бота!", {
        ctx,
        datapath: "bot.commands",
      });

    if (command === "/cancel" && ctx.session?.isActive) {
      await ctx.sessionClear?.();
      await ctx.reply("Действие отменено");
      return;
    }

    const pointRoute = ctx.rules["*"];

    if (pointRoute) {
      if (pointRoute.route === "*" && pointRoute.enable) {
        await returnCommandHelper(command, ctx, next);
        return;
      }
    }

    const rule = ctx.rules[command];

    if (!rule) {
      throw new LoggerBot("Нет прав доступа!", {
        ctx,
        datapath: "permissions.accessDenied",
      });
    }

    if (!rule.enable) {
      throw new LoggerBot("Нет прав доступа!", {
        ctx,
        datapath: "permissions.accessDenied",
      });
    }

    await returnCommandHelper(command, ctx, next);
    return;
  } catch (error) {
    logger.info(error instanceof Error ? error.message : String(error));
  }
}
