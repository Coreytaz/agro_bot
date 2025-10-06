import type { NextFunction } from "grammy";

import type { Context } from "../core/interface/Context";
import { adminCallbackHandler } from "./admin";
import cardRename from "./cardRename";
import language from "./language";
import processStart from "./process.start";
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
  ...language,
};

export default callbackHandlers;
