import type { NextFunction } from "grammy";

import type { Context } from "../core/interface/Context";
import about from "./about";
import { adminCallbackHandler } from "./admin";
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
  "admin_content": adminCallbackHandler,
  "admin_broadcast": adminCallbackHandler,
  "admin_model_settings": adminCallbackHandler,
  "admin_statistics": adminCallbackHandler,
  "admin_users": adminCallbackHandler,
  "admin_back": adminCallbackHandler,
  "about": about,
  "help": help,
  "menu": menu,
  "settings": settings,
  ...language,
};

export default callbackHandlers;
