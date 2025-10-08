import type { Context } from "../core/interface/Context";
import { createAdminMenuKeyboard, createBroadcastMenuKeyboard } from "../utils";

export const ADMIN_BACK_KEY = "admin_back";

async function adminBroadcast(ctx: Context) {
  await ctx.answerCallbackQuery();
  const [title, keyboard] = await createBroadcastMenuKeyboard(ctx);
  await ctx.editMessageText(title, {
    reply_markup: keyboard,
  });
}

async function adminModelSettings(ctx: Context) {
  await ctx.answerCallbackQuery();
  await ctx.editMessageText(
    "🤖 Настройки модели\n\nЗдесь будут настройки ИИ модели",
    {
      reply_markup: {
        inline_keyboard: [[{ text: "⬅️ Назад", callback_data: "admin_back" }]],
      },
    },
  );
}

async function adminStatistics(ctx: Context) {
  await ctx.answerCallbackQuery();
  await ctx.editMessageText("📊 Статистика\n\nЗдесь будет статистика бота", {
    reply_markup: {
      inline_keyboard: [[{ text: "⬅️ Назад", callback_data: "admin_back" }]],
    },
  });
}

async function adminBack(ctx: Context) {
  await ctx.answerCallbackQuery();
  const [title, keyboard] = await createAdminMenuKeyboard(ctx);
  await ctx.editMessageText(title, {
    reply_markup: keyboard,
  });
}

export default {
  [ADMIN_BACK_KEY]: adminBack,
  "admin_broadcast": adminBroadcast,
  "admin_model_settings": adminModelSettings,
  "admin_statistics": adminStatistics,
};
