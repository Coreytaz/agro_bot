import type { Context } from "../core/interface/Context";
import { createAdminMenuKeyboard } from "../utils";

async function adminContent(ctx: Context) {
  await ctx.answerCallbackQuery();
  await ctx.editMessageText(
    "📝 Управление контентом\n\nЗдесь будет функционал управления контентом",
    {
      reply_markup: {
        inline_keyboard: [
          [{ text: "⬅️ Назад", callback_data: "admin_back" }],
        ],
      },
    },
  );
}

async function adminBroadcast(ctx: Context) {
  await ctx.answerCallbackQuery();
  await ctx.editMessageText(
    "📢 Рассылка\n\nЗдесь будет функционал рассылки сообщений",
    {
      reply_markup: {
        inline_keyboard: [
          [{ text: "⬅️ Назад", callback_data: "admin_back" }],
        ],
      },
    },
  );
}

async function adminModelSettings(ctx: Context) {
  await ctx.answerCallbackQuery();
  await ctx.editMessageText(
    "🤖 Настройки модели\n\nЗдесь будут настройки ИИ модели",
    {
      reply_markup: {
        inline_keyboard: [
          [{ text: "⬅️ Назад", callback_data: "admin_back" }],
        ],
      },
    },
  );
}

async function adminStatistics(ctx: Context) {
  await ctx.answerCallbackQuery();
  await ctx.editMessageText(
    "📊 Статистика\n\nЗдесь будет статистика бота",
    {
      reply_markup: {
        inline_keyboard: [
          [{ text: "⬅️ Назад", callback_data: "admin_back" }],
        ],
      },
    },
  );
}

async function adminUsers(ctx: Context) {
  await ctx.answerCallbackQuery();
  await ctx.editMessageText(
    "👥 Пользователи\n\nЗдесь будет управление пользователями",
    {
      reply_markup: {
        inline_keyboard: [
          [{ text: "⬅️ Назад", callback_data: "admin_back" }],
        ],
      },
    },
  );
}

async function adminBack(ctx: Context) {
  await ctx.answerCallbackQuery();
  const [title, keyboard] = await createAdminMenuKeyboard(ctx);
  await ctx.editMessageText(title, {
    reply_markup: keyboard,
  });
}

export default {
  "admin_content": adminContent,
  "admin_broadcast": adminBroadcast,
  "admin_model_settings": adminModelSettings,
  "admin_statistics": adminStatistics,
  "admin_users": adminUsers,
  "admin_back": adminBack,
};
