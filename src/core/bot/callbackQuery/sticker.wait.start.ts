import type { NextFunction } from "grammy";

import type { Context } from "../core/interface/Context";

export default async function stickerWaitStart(
  ctx: Context,
  next: NextFunction,
) {
  await ctx.sessionSet?.({ route: "sticker.wait", ttlSec: 5 * 60 });
  await ctx.editAndReply.reply(
    "Режим ожидания: отправьте стикер\n/cancel — отменить",
  );
  await next();
}
