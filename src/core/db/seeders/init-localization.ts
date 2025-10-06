import logger from "@core/utils/logger";

import { drizzle } from "../drizzle";
import { LocalizationKey } from "../interface";
import { localization } from "../models";

interface LocalizationData {
  key: LocalizationKey;
  locale: string;
  value: string;
  description: string;
}

// Начальные данные локализации для русского языка
const initialLocalizationData: LocalizationData[] = [
  {
    key: "menu.title",
    locale: "ru",
    value: "📋 Главное меню",
    description: "Заголовок главного меню",
  },
  {
    key: "menu.title",
    locale: "en",
    value: "📋 Main Menu",
    description: "Main menu title",
  },
  // Настройки
  {
    key: "settings.title",
    locale: "ru",
    value: "⚙️ Настройки",
    description: "Заголовок настроек",
  },
  {
    key: "settings.title",
    locale: "en",
    value: "⚙️ Settings",
    description: "Settings title",
  },
  {
    key: "settings.language",
    locale: "ru",
    value: "🌐 Язык интерфейса",
    description: "Смена языка интерфейса",
  },
  {
    key: "settings.language",
    locale: "en",
    value: "🌐 Interface Language",
    description: "Change interface language",
  },
  {
    key: "settings.language.select",
    locale: "ru",
    value: "🌐 Выберите язык",
    description: "Текст выбора языка",
  },
  {
    key: "settings.language.select",
    locale: "en",
    value: "Select language:",
    description: "Language selection text",
  },
  {
    key: "settings.language.changed",
    locale: "ru",
    value: "✅ Язык успешно изменен!",
    description: "Подтверждение смены языка",
  },
  {
    key: "settings.language.changed",
    locale: "en",
    value: "✅ Language changed successfully!",
    description: "Language change confirmation",
  },
  // Языки
  {
    key: "language.ru",
    locale: "ru",
    value: "🇷🇺 Русский",
    description: "Русский язык",
  },
  {
    key: "language.ru",
    locale: "en",
    value: "🇷🇺 Russian",
    description: "Russian language",
  },
  {
    key: "language.en",
    locale: "ru",
    value: "🇺🇸 English",
    description: "Английский язык",
  },
  {
    key: "language.en",
    locale: "en",
    value: "🇺🇸 English",
    description: "English language",
  },
  // Кнопки
  {
    key: "button.back",
    locale: "ru",
    value: "⬅️ Назад",
    description: "Кнопка назад",
  },
  {
    key: "button.back",
    locale: "en",
    value: "⬅️ Back",
    description: "Back button",
  },

  // Система блокировок и банов
  {
    key: "blocking.chat.blocked",
    locale: "ru",
    value: "✅ Чат заблокирован",
    description: "Сообщение об успешной блокировке чата",
  },
  {
    key: "blocking.chat.blocked",
    locale: "en",
    value: "✅ Chat blocked",
    description: "Chat blocked successfully message",
  },
  {
    key: "blocking.chat.unblocked",
    locale: "ru",
    value: "✅ Чат разблокирован",
    description: "Сообщение об успешной разблокировке чата",
  },
  {
    key: "blocking.chat.unblocked",
    locale: "en",
    value: "✅ Chat unblocked",
    description: "Chat unblocked successfully message",
  },
  {
    key: "blocking.user.banned",
    locale: "ru",
    value: "✅ Пользователь заблокирован",
    description: "Сообщение об успешной блокировке пользователя",
  },
  {
    key: "blocking.user.banned",
    locale: "en",
    value: "✅ User banned",
    description: "User banned successfully message",
  },
  {
    key: "blocking.user.unbanned",
    locale: "ru",
    value: "✅ Пользователь разблокирован",
    description: "Сообщение об успешной разблокировке пользователя",
  },
  {
    key: "blocking.user.unbanned",
    locale: "en",
    value: "✅ User unbanned",
    description: "User unbanned successfully message",
  },
  {
    key: "blocking.user.banned.temporary",
    locale: "ru",
    value: "⏰ Временный бан",
    description: "Указание на временный бан",
  },
  {
    key: "blocking.user.banned.temporary",
    locale: "en",
    value: "⏰ Temporary ban",
    description: "Temporary ban indication",
  },
  {
    key: "blocking.user.banned.permanent",
    locale: "ru",
    value: "♾️ Постоянный бан",
    description: "Указание на постоянный бан",
  },
  {
    key: "blocking.user.banned.permanent",
    locale: "en",
    value: "♾️ Permanent ban",
    description: "Permanent ban indication",
  },
  {
    key: "blocking.blocked.message",
    locale: "ru",
    value: "🚫 Этот чат заблокирован администратором\nПричина: ",
    description: "Сообщение для заблокированного чата",
  },
  {
    key: "blocking.blocked.message",
    locale: "en",
    value: "🚫 This chat has been blocked by the administrator\nReason: ",
    description: "Message for blocked chat",
  },
  {
    key: "blocking.banned.message",
    locale: "ru",
    value: "🚫 Вы заблокированы администратором",
    description: "Сообщение для заблокированного пользователя",
  },
  {
    key: "blocking.banned.message",
    locale: "en",
    value: "🚫 You are banned by administrator",
    description: "Message for banned user",
  },
  {
    key: "blocking.access.denied",
    locale: "ru",
    value: "❌ У вас нет прав для выполнения этой команды",
    description: "Отказ в доступе к команде",
  },
  {
    key: "blocking.access.denied",
    locale: "en",
    value: "❌ You don't have permission to execute this command",
    description: "Access denied to command",
  },
  {
    key: "blocking.command.invalid.format",
    locale: "ru",
    value: "❌ Неверный формат команды",
    description: "Ошибка неверного формата команды",
  },
  {
    key: "blocking.command.invalid.format",
    locale: "en",
    value: "❌ Invalid command format",
    description: "Invalid command format error",
  },
  {
    key: "blocking.chat.not.found",
    locale: "ru",
    value: "❌ Чат не найден в базе данных",
    description: "Ошибка - чат не найден",
  },
  {
    key: "blocking.chat.not.found",
    locale: "en",
    value: "❌ Chat not found in database",
    description: "Error - chat not found",
  },
  {
    key: "blocking.user.not.found",
    locale: "ru",
    value: "❌ Пользователь не найден",
    description: "Ошибка - пользователь не найден",
  },
  {
    key: "blocking.user.not.found",
    locale: "en",
    value: "❌ User not found",
    description: "Error - user not found",
  },
  {
    key: "blocking.already.blocked",
    locale: "ru",
    value: "❌ Этот чат уже заблокирован",
    description: "Ошибка - чат уже заблокирован",
  },
  {
    key: "blocking.already.blocked",
    locale: "en",
    value: "❌ This chat is already blocked",
    description: "Error - chat already blocked",
  },
  {
    key: "blocking.already.banned",
    locale: "ru",
    value: "❌ Этот пользователь уже заблокирован в данном чате",
    description: "Ошибка - пользователь уже заблокирован",
  },
  {
    key: "blocking.already.banned",
    locale: "en",
    value: "❌ This user is already banned in this chat",
    description: "Error - user already banned",
  },
  {
    key: "blocking.not.blocked",
    locale: "ru",
    value: "❌ Этот чат не заблокирован",
    description: "Ошибка - чат не заблокирован",
  },
  {
    key: "blocking.not.blocked",
    locale: "en",
    value: "❌ This chat is not blocked",
    description: "Error - chat not blocked",
  },
  {
    key: "blocking.not.banned",
    locale: "ru",
    value: "❌ Этот пользователь не заблокирован в данном чате",
    description: "Ошибка - пользователь не заблокирован",
  },
  {
    key: "blocking.not.banned",
    locale: "en",
    value: "❌ This user is not banned in this chat",
    description: "Error - user not banned",
  },
  {
    key: "blocking.stats.title",
    locale: "ru",
    value: "📊 Статистика банов",
    description: "Заголовок статистики банов",
  },
  {
    key: "blocking.stats.title",
    locale: "en",
    value: "📊 Ban Statistics",
    description: "Ban statistics title",
  },
  {
    key: "blocking.stats.active",
    locale: "ru",
    value: "🚫 Активные баны",
    description: "Активные баны в статистике",
  },
  {
    key: "blocking.stats.active",
    locale: "en",
    value: "🚫 Active bans",
    description: "Active bans in statistics",
  },
  {
    key: "blocking.stats.expired",
    locale: "ru",
    value: "⏰ Истекшие баны",
    description: "Истекшие баны в статистике",
  },
  {
    key: "blocking.stats.expired",
    locale: "en",
    value: "⏰ Expired bans",
    description: "Expired bans in statistics",
  },
  {
    key: "blocking.stats.permanent",
    locale: "ru",
    value: "♾️ Постоянные баны",
    description: "Постоянные баны в статистике",
  },
  {
    key: "blocking.stats.permanent",
    locale: "en",
    value: "♾️ Permanent bans",
    description: "Permanent bans in statistics",
  },
  {
    key: "blocking.stats.total",
    locale: "ru",
    value: "📈 Всего банов в истории",
    description: "Общее количество банов",
  },
  {
    key: "blocking.stats.total",
    locale: "en",
    value: "📈 Total bans in history",
    description: "Total bans count",
  },
  {
    key: "blocking.list.title",
    locale: "ru",
    value: "📋 Список активных банов",
    description: "Заголовок списка банов",
  },
  {
    key: "blocking.list.title",
    locale: "en",
    value: "📋 Active Bans List",
    description: "Active bans list title",
  },
  {
    key: "blocking.list.empty",
    locale: "ru",
    value: "📝 Активных банов в этом чате нет",
    description: "Сообщение об отсутствии активных банов",
  },
  {
    key: "blocking.list.empty",
    locale: "en",
    value: "📝 No active bans in this chat",
    description: "No active bans message",
  },
  {
    key: "common.operation.success",
    locale: "ru",
    value: "✅ Операция выполнена успешно",
    description: "Сообщение об успешной операции",
  },
  {
    key: "common.operation.success",
    locale: "en",
    value: "✅ Operation completed successfully",
    description: "Operation success message",
  },
  {
    key: "common.operation.error",
    locale: "ru",
    value: "❌ Произошла ошибка при выполнении операции",
    description: "Сообщение об ошибке операции",
  },
  {
    key: "common.operation.error",
    locale: "en",
    value: "❌ An error occurred while performing the operation",
    description: "Operation error message",
  },
];

export default async function seedLocalization() {
  try {
    const existingLocalizations = await drizzle
      .select()
      .from(localization)
      .all();

    if (existingLocalizations.length > 0) {
      logger.info("Localization data already exists, skipping seeding.");
      return;
    }

    await drizzle.insert(localization).values(initialLocalizationData).run();

    logger.info(
      `Localization seeded successfully! Added ${initialLocalizationData.length} entries.`,
    );
  } catch (error) {
    logger.error("Error seeding localization data:", error);
    throw error;
  }
}
