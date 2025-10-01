import type { NextFunction } from "grammy";

import type { Context } from "../core/interface/Context";

export default async function cardRename(
  ctx: Context,
  next: NextFunction,
) {
  const idParam = ctx.paramsExtractor?.params?.id;
  const cardId = idParam ? Number(idParam) : undefined;
  if (!cardId || Number.isNaN(cardId)) {
    await ctx.editAndReply.reply("Не удалось определить карточку");
    return;
  }

  await ctx.sessionSet?.({
    route: "card.rename.wait",
    data: { cardId },
    ttlSec: 5 * 60,
  });

  await ctx.editAndReply.reply(
    "Отправьте новое название карточки\n/cancel — отменить",
  );
  await next();
}
