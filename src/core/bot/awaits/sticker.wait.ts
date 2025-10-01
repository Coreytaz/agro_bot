import type { NextFunction } from "grammy";

import type { Context } from "../core/interface/Context";

export default async function stickerWait(
  ctx: Context,
  next: NextFunction,
) {
  // Отмена
  if (ctx.message?.text === "/cancel") {
    await ctx.sessionClear?.();
    await ctx.editAndReply.reply("Действие отменено");
    return;
  }

  // Проверяем, пришёл ли стикер
  const sticker = ctx.message?.sticker;
  if (!sticker) {
    await ctx.editAndReply.reply(
      "Отправьте стикер (или /cancel для отмены)",
    );
    return;
  }

  // Успех: можно сохранить sticker.file_id в БД или использовать далее
  // TODO: сохранить sticker.file_id, sticker.emoji и пр. при необходимости
  await ctx.sessionClear?.();
  await ctx.editAndReply.reply(
    `Стикер получен. file_id: ${sticker.file_id}`,
  );

  await next();
}
