import type { NextFunction } from "grammy";

import { broadcastCustomCronWait } from "../callbackQuery/broadcast-schedule";
import type { Context } from "../core/interface/Context";
import adminContentEditWait from "./admin-content-edit-wait";
import broadcastCreateWait from "./broadcast-create-wait";
import broadcastEditWait from "./broadcast-edit-wait";
import cardRenameWait from "./cardRenameWait";
import stickerWait from "./sticker.wait";

type AwaitHandler = (ctx: Context, next: NextFunction) => Promise<void>;

const awaits: Record<string, AwaitHandler> = {
  "card.rename.wait": cardRenameWait,
  "sticker.wait": stickerWait,
  broadcast_schedule_custom_wait: broadcastCustomCronWait,
  ...adminContentEditWait,
  ...broadcastCreateWait,
  ...broadcastEditWait,
};

export default awaits;
