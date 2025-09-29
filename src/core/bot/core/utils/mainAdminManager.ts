import { addMainAdminToChat, getMainAdminsForChat, removeMainAdminFromChat } from "@core/db/models";

import type { Context } from "../interface/Context";
import { createMsg } from "./createMsg";
import { loggerTG } from "./logger";

/**
 * Добавляет главного администратора к чату
 * @param chatId - ID чата (внутренний ID из базы данных)
 * @param adminChatId - Telegram chat ID администратора
 * @param adminName - Имя администратора (опционально)
 */
export async function addChatMainAdmin(
  chatId: number,
  adminChatId: string,
  adminName?: string
): Promise<boolean> {
  try {
    await addMainAdminToChat(chatId, adminChatId, adminName);
    await loggerTG.info(
      `Добавлен главный администратор ${adminName ?? adminChatId} для чата ID ${chatId}`
    );
    return true;
  } catch (error) {
    await loggerTG.error(
      `Ошибка при добавлении главного администратора: ${String(error)}`
    );
    return false;
  }
}

/**
 * Удаляет главного администратора из чата
 * @param chatId - ID чата (внутренний ID из базы данных)
 * @param adminChatId - Telegram chat ID администратора
 */
export async function removeChatMainAdmin(
  chatId: number,
  adminChatId: string
): Promise<boolean> {
  try {
    await removeMainAdminFromChat(chatId, adminChatId);
    await loggerTG.info(
      `Удален главный администратор ${adminChatId} из чата ID ${chatId}`
    );
    return true;
  } catch (error) {
    await loggerTG.error(
      `Ошибка при удалении главного администратора: ${String(error)}`
    );
    return false;
  }
}

/**
 * Получает список главных администраторов чата
 * @param chatId - ID чата (внутренний ID из базы данных)
 */
export async function getChatMainAdminsList(chatId: number) {
  try {
    const admins = await getMainAdminsForChat(chatId);
    return admins;
  } catch (error) {
    await loggerTG.error(
      `Ошибка при получении списка главных администраторов: ${String(error)}`
    );
    return [];
  }
}

/**
 * Отправляет список главных администраторов в чат
 * @param ctx - Контекст бота
 * @param chatId - ID чата (внутренний ID из базы данных)
 */
export async function sendMainAdminsList(ctx: Context, chatId: number) {
  try {
    const admins = await getChatMainAdminsList(chatId);
    
    if (admins.length === 0) {
      const msg = createMsg("info", "Для этого чата не настроены главные администраторы");
      await ctx.reply(msg.text, { entities: msg.entities });
      return;
    }

    let adminsList = "👥 Главные администраторы чата:\n\n";
    admins.forEach((admin, index) => {
      adminsList += `${index + 1}. ${admin.name ?? "Без имени"}\n`;
      adminsList += `   ID: ${admin.adminChatId}\n\n`;
    });

    const msg = createMsg("info", adminsList);
    await ctx.reply(msg.text, { entities: msg.entities });
  } catch (error) {
    await loggerTG.error(
      `Ошибка при отправке списка администраторов: ${String(error)}`
    );
    const msg = createMsg("error", "Не удалось получить список администраторов");
    await ctx.reply(msg.text, { entities: msg.entities });
  }
}