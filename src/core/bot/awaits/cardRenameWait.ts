import type { NextFunction } from "grammy";

import type { Context } from "../core/interface/Context";

export default async function cardRenameWait(
  ctx: Context,
  next: NextFunction,
) {
  const name = ctx.message?.text?.trim();
  if (!name) {
    await ctx.editAndReply.reply(
      "Введите текст для названия или /cancel чтобы отменить",
    );
    return;
  }

  if (name === "/cancel") {
    await ctx.sessionClear?.();
    await ctx.editAndReply.reply("Действие отменено");
    return;
  }

  const raw = ctx.session?.data ?? {};
  const cardId = typeof (raw as any).cardId === "number" ? (raw as any).cardId : undefined;
  if (!cardId) {
    await ctx.reply("Сессия устарела, попробуйте ещё раз");
    await ctx.sessionClear?.();
    return;
  }

  // TODO: обновить карточку в БД (пример, заменить на вашу модель)
  // await updateCard({ id: cardId, name });

  await ctx.sessionClear?.();
  await ctx.editAndReply.reply(`Название обновлено: ${name}`);
  // TODO: отправить клавиатуру карточки (замените на ваш builder)
  // await ctx.reply("Карточка:", { reply_markup: buildCardKeyboard(cardId) });
  await next();
}
