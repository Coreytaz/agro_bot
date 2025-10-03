import type { NextFunction } from "grammy";

import type { Context } from "../core/interface/Context";
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
  ...language,
};

export default callbackHandlers;
