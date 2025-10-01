import type { NextFunction } from "grammy";

import type { Context } from "../core/interface/Context";
import cardRenameWait from "./cardRenameWait";
import stickerWait from "./sticker.wait";

type AwaitHandler = (ctx: Context, next: NextFunction) => Promise<void>;

const awaits: Record<string, AwaitHandler> = {
  "card.rename.wait": cardRenameWait,
  "sticker.wait": stickerWait,
};

export default awaits;
