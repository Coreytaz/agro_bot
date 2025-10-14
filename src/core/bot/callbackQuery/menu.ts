import type { Context } from "../core/interface/Context";
import { createMainMenuKeyboard } from "../utils";

export default async function menu(ctx: Context) {
  const [title, keyboard] = await createMainMenuKeyboard(ctx);
  await ctx.answerCallbackQuery();
  await ctx.editAndReply.reply(title, {
    reply_markup: keyboard,
    parse_mode: "Markdown",
  });
}
