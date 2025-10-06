import type { Context } from "../core/interface/Context";
import { createSettingMenuKeyboard } from "../utils";

export default async function settings(ctx: Context) {
  const [title, keyboard] = await createSettingMenuKeyboard(ctx);
  await ctx.answerCallbackQuery();
  await ctx.editAndReply.reply(title, { reply_markup: keyboard });
}
