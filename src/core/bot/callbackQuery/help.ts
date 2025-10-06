import type { Context } from "../core/interface/Context";
import { createHelpMenuKeyboard } from "../utils/createHelpMenuKeyboard";

export default async function help(ctx: Context) {
  const [message, keyboard] = await createHelpMenuKeyboard(ctx);

  await ctx.answerCallbackQuery();
  await ctx.editAndReply.reply(message, {
    reply_markup: keyboard,
    parse_mode: "Markdown",
  });
}
