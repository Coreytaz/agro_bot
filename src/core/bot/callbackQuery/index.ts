import type { NextFunction } from "grammy";

import type { Context } from "../core/interface/Context";
import about from "./about";
import admin from "./admin";
import cardRename from "./cardRename";
import help from "./help";
import language from "./language";
import menu from "./menu";
import processStart from "./process.start";
import settings from "./settings";
import stickerWaitStart from "./sticker.wait.start";

const callbackHandlers: Record<
  string,
  (ctx: Context, next: NextFunction) => Promise<void>
> = {
  "card.rename": cardRename,
  "sticker.wait.start": stickerWaitStart,
  "process.start": processStart,
  "about": about,
  "help": help,
  "menu": menu,
  "settings": settings,
  ...language,
  ...admin,
};

export default callbackHandlers;
