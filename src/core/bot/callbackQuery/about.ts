import type { Context } from "../core/interface/Context";
import { createAboutMenuKeyboard } from "../utils";

export default async function about(ctx: Context) {
  const [message, keyboard] = await createAboutMenuKeyboard(ctx);

  await ctx.answerCallbackQuery();
  await ctx.editAndReply.reply(message, {
    reply_markup: keyboard,
    parse_mode: "Markdown",
  });
}
