import type { Context } from "../core/interface/Context";
import { createAdminMenuKeyboard } from "../utils";

export const adminCallbackHandler = async (ctx: Context) => {
  const callbackData = ctx.callbackQuery?.data;

  await ctx.answerCallbackQuery();

  switch (callbackData) {
    case "admin_content":
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
      break;

    case "admin_broadcast":
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
      break;

    case "admin_model_settings":
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
      break;

    case "admin_statistics":
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
      break;

    case "admin_users":
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
      break;

    case "admin_back":
      const [title, keyboard] = await createAdminMenuKeyboard(ctx);
      await ctx.editMessageText(title, {
        reply_markup: keyboard,
      });
      break;

    default:
      break;
  }
};
