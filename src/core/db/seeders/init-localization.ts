import logger from "@core/utils/logger";

import { drizzle } from "../drizzle";
import { LocalizationKey, SupportedLocale } from "../interface";
import { localization } from "../models";

interface LocalizationData {
  key: LocalizationKey;
  locale: SupportedLocale;
  value: string;
  description: string;
}

// Начальные данные локализации для русского языка
const initialLocalizationData: LocalizationData[] = [
  // Команды - Стартовое сообщение
  {
    key: "commands.start.message",
    locale: "ru",
    value:
      "👋 Добро пожаловать в AgroBot — вашего помощника в диагностике болезней растений!\n\nЯ могу помочь определить заболевание по фото и дать рекомендации по лечению.\n\nЧтобы начать:\n• Выберите культуру из списка\n• Сделайте или загрузите четкое фото пораженного листа\n• Используйте команду /menu для вызова главного меню",
    description: "Полное стартовое сообщение команды /start",
  },
  {
    key: "commands.start.message",
    locale: "en",
    value:
      "👋 Welcome to AgroBot — your assistant in plant disease diagnosis!\n\nI can help identify diseases from photos and provide treatment recommendations.\n\nTo get started:\n• Select a crop from the list\n• Take or upload a clear photo of the affected leaf\n• Use the /menu command to open the main menu",
    description: "Complete start message for /start command",
  },
  // Команды - Меню
  {
    key: "commands.menu.message",
    locale: "ru",
    value:
      "👋 Приветствую! Я — ваш персональный Agro-эксперт!\n\nЯ помогу определить *болезнь растения* по фотографии листа и дам экологичные рекомендации по лечению и профилактике.\n\n📋 Главное меню",
    description: "Полное сообщение команды /menu",
  },
  {
    key: "commands.menu.message",
    locale: "en",
    value:
      "👋 Greetings! I am your personal Agro-expert!\n\nI will help identify *plant diseases* from leaf photographs and provide eco-friendly treatment and prevention recommendations.\n\n📋 Main Menu",
    description: "Complete menu message for /menu command",
  },
  // Кнопки меню
  {
    key: "menu.button.diagnosis",
    locale: "ru",
    value: "🔍 Начать диагностику",
    description: "Кнопка начала диагностики в главном меню",
  },
  {
    key: "menu.button.diagnosis",
    locale: "en",
    value: "🔍 Start Diagnosis",
    description: "Start diagnosis button in main menu",
  },
  {
    key: "menu.button.knowledge",
    locale: "ru",
    value: "📚 База знаний",
    description: "Кнопка базы знаний в главном меню",
  },
  {
    key: "menu.button.knowledge",
    locale: "en",
    value: "📚 Knowledge Base",
    description: "Knowledge base button in main menu",
  },
  {
    key: "menu.button.help",
    locale: "ru",
    value: "❓ Помощь",
    description: "Кнопка помощи в главном меню",
  },
  {
    key: "menu.button.help",
    locale: "en",
    value: "❓ Help",
    description: "Help button in main menu",
  },
  {
    key: "menu.button.about",
    locale: "ru",
    value: "ℹ️ О боте",
    description: "Кнопка информации о боте в главном меню",
  },
  {
    key: "menu.button.about",
    locale: "en",
    value: "ℹ️ About Bot",
    description: "About bot button in main menu",
  },
  {
    key: "menu.button.settings",
    locale: "ru",
    value: "⚙️ Настройки",
    description: "Кнопка настроек в главном меню",
  },
  {
    key: "menu.button.settings",
    locale: "en",
    value: "⚙️ Settings",
    description: "Settings button in main menu",
  },

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
  // О боте
  {
    key: "about.message",
    locale: "ru",
    value:
      "🤖 **AgroBot v1.0**\n\nЭто демонстрационный бот для диагностики заболеваний растений с помощью искусственного интеллекта.\n\n**Как это работает?**\nВы загружаете фото, а нейросеть, обученная на тысячах изображений, анализирует его и сравнивает с известными заболеваниями выбранной культуры.",
    description: "Сообщение страницы о боте",
  },
  {
    key: "about.message",
    locale: "en",
    value:
      "🤖 **AgroBot v1.0**\n\nThis is a demonstration bot for diagnosing plant diseases using artificial intelligence.\n\n**How does it work?**\nYou upload a photo, and the neural network, trained on thousands of images, analyzes it and compares it with known diseases of the selected crop.",
    description: "About bot page message",
  },
  // Помощь
  {
    key: "help.message",
    locale: "ru",
    value:
      '📖 **Справка по использованию бота:**\n\nНачните с команды /start или кнопки "Начать диагностику".\n\nВыберите культуру из предложенного списка.\n\nЗагрузите фото листа или плода с признаками заболевания.\n\nПолучите диагноз и рекомендации по лечению.\n\n**Важно:**\n• Фотография должна быть четкой, сделанной при хорошем освещении.\n• Бот не заменяет консультацию профессионального агронома в сложных случаях.\n\n**Доступные команды:**\n/start - запустить бота\n/help - показать эту справку\n/menu - открыть главное меню\n/about - информация о боте',
    description: "Сообщение справки по использованию бота",
  },
  {
    key: "help.message",
    locale: "en",
    value:
      '📖 **Bot Usage Guide:**\n\nStart with the /start command or "Start Diagnosis" button.\n\nSelect a crop from the suggested list.\n\nUpload a photo of a leaf or fruit with signs of disease.\n\nGet a diagnosis and treatment recommendations.\n\n**Important:**\n• The photo should be clear, taken in good lighting.\n• The bot does not replace consultation with a professional agronomist in complex cases.\n\n**Available commands:**\n/start - launch the bot\n/help - show this guide\n/menu - open main menu\n/about - bot information',
    description: "Bot usage guide message",
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
    value: "🌐 Select language",
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
  {
    key: "settings.notifications",
    locale: "ru",
    value: "🔔 Уведомления",
    description: "Настройки уведомлений",
  },
  {
    key: "settings.notifications",
    locale: "en",
    value: "🔔 Notifications",
    description: "Notification settings",
  },
  {
    key: "settings.notifications.on",
    locale: "ru",
    value: "🔔 Включить",
    description: "Кнопка включения уведомлений",
  },
  {
    key: "settings.notifications.on",
    locale: "en",
    value: "🔔 Turn On",
    description: "Turn on notifications button",
  },
  {
    key: "settings.notifications.off",
    locale: "ru",
    value: "🔕 Отключить",
    description: "Кнопка отключения уведомлений",
  },
  {
    key: "settings.notifications.off",
    locale: "en",
    value: "🔕 Turn Off",
    description: "Turn off notifications button",
  },
  {
    key: "settings.notifications.enabled",
    locale: "ru",
    value: "✅ Уведомления включены",
    description: "Статус включенных уведомлений",
  },
  {
    key: "settings.notifications.enabled",
    locale: "en",
    value: "✅ Notifications enabled",
    description: "Notifications enabled status",
  },
  {
    key: "settings.notifications.disabled",
    locale: "ru",
    value: "❌ Уведомления отключены",
    description: "Статус отключенных уведомлений",
  },
  {
    key: "settings.notifications.disabled",
    locale: "en",
    value: "❌ Notifications disabled",
    description: "Notifications disabled status",
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
    value: "🇺🇸 Английский",
    description: "Английский язык",
  },
  {
    key: "language.en",
    locale: "en",
    value: "🇺🇸 English",
    description: "English language",
  },

  // Общие
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
  {
    key: "button.cancel",
    locale: "ru",
    value: "❌ Отмена",
    description: "Кнопка отмены",
  },
  {
    key: "button.cancel",
    locale: "en",
    value: "❌ Cancel",
    description: "Cancel button",
  },
  {
    key: "button.refresh",
    locale: "ru",
    value: "🔄 Обновить",
    description: "Кнопка обновить",
  },
  {
    key: "button.refresh",
    locale: "en",
    value: "🔄 Refresh",
    description: "Refresh button",
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

  // Админ панель
  {
    key: "admin.menu.title",
    locale: "ru",
    value: "🛠️ Админ панель",
    description: "Заголовок админ панели",
  },
  {
    key: "admin.menu.title",
    locale: "en",
    value: "🛠️ Admin Panel",
    description: "Admin panel title",
  },
  {
    key: "admin.menu.content",
    locale: "ru",
    value: "📝 Управление контентом",
    description: "Приветствие в админ панели",
  },
  {
    key: "admin.menu.content",
    locale: "en",
    value: "📝 Content Management",
    description: "Admin panel greeting",
  },
  {
    key: "admin.menu.broadcast",
    locale: "ru",
    value: "📢 Рассылка",
    description: "Опция рассылки в админ панели",
  },
  {
    key: "admin.menu.broadcast",
    locale: "en",
    value: "📢 Broadcast",
    description: "Broadcast option in admin panel",
  },
  {
    key: "admin.menu.model.settings",
    locale: "ru",
    value: "🤖 Настройки модели",
    description: "Опция настроек модели в админ панели",
  },
  {
    key: "admin.menu.model.settings",
    locale: "en",
    value: "🤖 Model Settings",
    description: "Model settings option in admin panel",
  },
  {
    key: "admin.menu.statistics",
    locale: "ru",
    value: "📊 Статистика",
    description: "Опция статистики в админ панели",
  },
  {
    key: "admin.menu.statistics",
    locale: "en",
    value: "📊 Statistics",
    description: "Statistics option in admin panel",
  },
  {
    key: "admin.menu.users",
    locale: "ru",
    value: "👥 Пользователи",
    description: "Опция управления пользователями в админ панели",
  },
  {
    key: "admin.menu.users",
    locale: "en",
    value: "👥 Users",
    description: "User management option in admin panel",
  },

  // Контент
  {
    key: "admin.content.edit",
    locale: "ru",
    value: "✏️ Редактировать контент",
    description: "Кнопка редактирования контента",
  },
  {
    key: "admin.content.edit",
    locale: "en",
    value: "✏️ Edit Content",
    description: "Content edit button",
  },

  // Детальная информация о пользователе
  {
    key: "admin.user.detail.title",
    locale: "ru",
    value: "👤 Детальная информация о пользователе",
    description: "Заголовок детальной информации о пользователе",
  },
  {
    key: "admin.user.detail.title",
    locale: "en",
    value: "👤 User Detail Information",
    description: "User detail information title",
  },
  {
    key: "admin.user.detail.button.role",
    locale: "ru",
    value: "🛡️ Изменить роль",
    description: "Кнопка изменения роли пользователя",
  },
  {
    key: "admin.user.detail.button.role",
    locale: "en",
    value: "🛡️ Change Role",
    description: "Change role button",
  },
  {
    key: "admin.user.detail.button.info",
    locale: "ru",
    value: "ℹ️ Просмотреть информацию",
    description: "Кнопка просмотра информации о пользователе",
  },
  {
    key: "admin.user.detail.button.info",
    locale: "en",
    value: "ℹ️ View Info",
    description: "View user info button",
  },
  {
    key: "admin.user.detail.button.unban",
    locale: "ru",
    value: "🚫 Разбанить пользователя",
    description: "Кнопка разблокировки пользователя",
  },
  {
    key: "admin.user.detail.button.unban",
    locale: "en",
    value: "🚫 Unban User",
    description: "Unban user button",
  },
  {
    key: "admin.user.detail.button.ban",
    locale: "ru",
    value: "🚫 Заблокировать пользователя",
    description: "Кнопка блокировки пользователя",
  },
  {
    key: "admin.user.detail.button.ban",
    locale: "en",
    value: "🚫 Ban User",
    description: "Ban user button",
  },

  // Роли
  {
    key: "admin.user.role.current",
    locale: "ru",
    value: "🛡️ Текущая роль",
    description: "Текущая роль пользователя",
  },
  {
    key: "admin.user.role.current",
    locale: "en",
    value: "🛡️ Current Role",
    description: "Current role of the user",
  },
  {
    key: "admin.user.role.select",
    locale: "ru",
    value: "🔽 Выберите новую роль для пользователя",
    description: "Выбор роли пользователя",
  },
  {
    key: "admin.user.role.select",
    locale: "en",
    value: "🔽 Select New Role for User",
    description: "Select user role",
  },

  // Рассылка - Меню
  {
    key: "broadcast.menu.title",
    locale: "ru",
    value: "📢 Управление рассылками",
    description: "Заголовок меню рассылки",
  },
  {
    key: "broadcast.menu.title",
    locale: "en",
    value: "📢 Broadcast Management",
    description: "Broadcast menu title",
  },
  {
    key: "broadcast.menu.create",
    locale: "ru",
    value: "➕ Создать рассылку",
    description: "Кнопка создания новой рассылки",
  },
  {
    key: "broadcast.menu.create",
    locale: "en",
    value: "➕ Create Broadcast",
    description: "Create new broadcast button",
  },
  {
    key: "broadcast.menu.list",
    locale: "ru",
    value: "📋 Все рассылки",
    description: "Кнопка просмотра всех рассылок",
  },
  {
    key: "broadcast.menu.list",
    locale: "en",
    value: "📋 All Broadcasts",
    description: "View all broadcasts button",
  },
  {
    key: "broadcast.menu.drafts",
    locale: "ru",
    value: "📝 Черновики",
    description: "Кнопка просмотра черновиков рассылок",
  },
  {
    key: "broadcast.menu.drafts",
    locale: "en",
    value: "📝 Drafts",
    description: "View broadcast drafts button",
  },
  {
    key: "broadcast.menu.history",
    locale: "ru",
    value: "📚 История",
    description: "Кнопка просмотра истории рассылок",
  },
  {
    key: "broadcast.menu.history",
    locale: "en",
    value: "📚 History",
    description: "View broadcast history button",
  },

  // Рассылка - Создание
  {
    key: "broadcast.create.title",
    locale: "ru",
    value: "✏️ Создание новой рассылки",
    description: "Заголовок создания рассылки",
  },
  {
    key: "broadcast.create.title",
    locale: "en",
    value: "✏️ Creating New Broadcast",
    description: "Create broadcast title",
  },
  {
    key: "broadcast.create.enter.title",
    locale: "ru",
    value: "📝 Введите заголовок рассылки:",
    description: "Запрос ввода заголовка рассылки",
  },
  {
    key: "broadcast.create.enter.title",
    locale: "en",
    value: "📝 Enter broadcast title:",
    description: "Request broadcast title input",
  },
  {
    key: "broadcast.create.enter.message",
    locale: "ru",
    value: "💬 Введите текст сообщения:",
    description: "Запрос ввода текста рассылки",
  },
  {
    key: "broadcast.create.enter.message",
    locale: "en",
    value: "💬 Enter message text:",
    description: "Request broadcast message input",
  },
  {
    key: "broadcast.create.enter.image",
    locale: "ru",
    value: "🖼️ Отправьте изображение или нажмите 'Пропустить'",
    description: "Запрос добавления изображения",
  },
  {
    key: "broadcast.create.enter.image",
    locale: "en",
    value: "🖼️ Send an image or press 'Skip'",
    description: "Request image upload",
  },
  {
    key: "broadcast.create.preview",
    locale: "ru",
    value: "👀 Предварительный просмотр рассылки",
    description: "Заголовок предварительного просмотра",
  },
  {
    key: "broadcast.create.preview",
    locale: "en",
    value: "👀 Broadcast preview",
    description: "Preview title",
  },
  {
    key: "broadcast.create.confirm",
    locale: "ru",
    value: "✅ Подтвердить",
    description: "Кнопка подтверждения создания рассылки",
  },
  {
    key: "broadcast.create.confirm",
    locale: "en",
    value: "✅ Confirm",
    description: "Confirm broadcast creation button",
  },
  {
    key: "broadcast.create.success",
    locale: "ru",
    value: "🎉 Рассылка успешно создана!",
    description: "Сообщение об успешном создании рассылки",
  },
  {
    key: "broadcast.create.success",
    locale: "en",
    value: "🎉 Broadcast created successfully!",
    description: "Broadcast creation success message",
  },

  // Рассылка - Отправка
  {
    key: "broadcast.send.confirm",
    locale: "ru",
    value: "🚀 Подтвердить отправку рассылки?",
    description: "Подтверждение отправки рассылки",
  },
  {
    key: "broadcast.send.confirm",
    locale: "en",
    value: "🚀 Confirm broadcast sending?",
    description: "Confirm broadcast sending",
  },
  {
    key: "broadcast.send.progress",
    locale: "ru",
    value: "⏳ Идет отправка рассылки...",
    description: "Сообщение о процессе отправки",
  },
  {
    key: "broadcast.send.progress",
    locale: "en",
    value: "⏳ Sending broadcast...",
    description: "Broadcast sending progress message",
  },
  {
    key: "broadcast.send.success",
    locale: "ru",
    value: "✅ Рассылка успешно отправлена!",
    description: "Сообщение об успешной отправке",
  },
  {
    key: "broadcast.send.success",
    locale: "en",
    value: "✅ Broadcast sent successfully!",
    description: "Broadcast sent success message",
  },
  {
    key: "broadcast.send.error",
    locale: "ru",
    value: "❌ Ошибка при отправке рассылки",
    description: "Сообщение об ошибке отправки",
  },
  {
    key: "broadcast.send.error",
    locale: "en",
    value: "❌ Error sending broadcast",
    description: "Broadcast sending error message",
  },
  {
    key: "broadcast.send.now",
    locale: "ru",
    value: "📤 Отправить сейчас",
    description: "Кнопка отправки рассылки сейчас",
  },
  {
    key: "broadcast.send.now",
    locale: "en",
    value: "📤 Send now",
    description: "Send broadcast now button",
  },
  {
    key: "broadcast.schedule",
    locale: "ru",
    value: "⏰ Запланировать",
    description: "Кнопка планирования рассылки",
  },
  {
    key: "broadcast.schedule",
    locale: "en",
    value: "⏰ Schedule",
    description: "Schedule broadcast button",
  },
  {
    key: "broadcast.schedule.select",
    locale: "ru",
    value: "⏰ Выберите время отправки",
    description: "Заголовок выбора времени планирования",
  },
  {
    key: "broadcast.schedule.select",
    locale: "en",
    value: "⏰ Select sending time",
    description: "Schedule time selection title",
  },
  {
    key: "broadcast.schedule.now",
    locale: "ru",
    value: "📤 Сейчас",
    description: "Опция отправки сейчас",
  },
  {
    key: "broadcast.schedule.now",
    locale: "en",
    value: "📤 Now",
    description: "Send now option",
  },
  {
    key: "broadcast.schedule.daily",
    locale: "ru",
    value: "📅 Ежедневно",
    description: "Опция ежедневной отправки",
  },
  {
    key: "broadcast.schedule.daily",
    locale: "en",
    value: "📅 Daily",
    description: "Daily sending option",
  },
  {
    key: "broadcast.schedule.weekly",
    locale: "ru",
    value: "📆 Еженедельно",
    description: "Опция еженедельной отправки",
  },
  {
    key: "broadcast.schedule.weekly",
    locale: "en",
    value: "📆 Weekly",
    description: "Weekly sending option",
  },
  {
    key: "broadcast.schedule.custom",
    locale: "ru",
    value: "⚙️ Своё расписание",
    description: "Опция кастомного расписания",
  },
  {
    key: "broadcast.schedule.custom",
    locale: "en",
    value: "⚙️ Custom schedule",
    description: "Custom schedule option",
  },
  {
    key: "broadcast.schedule.custom.enter",
    locale: "ru",
    value:
      "Введите cron-выражение (например: 0 9 * * * для ежедневной отправки в 9:00)",
    description: "Запрос ввода cron-выражения",
  },
  {
    key: "broadcast.schedule.custom.enter",
    locale: "en",
    value: "Enter cron expression (e.g.: 0 9 * * * for daily at 9:00 AM)",
    description: "Cron expression input request",
  },
  {
    key: "broadcast.schedule.custom.invalid",
    locale: "ru",
    value: "❌ Неверное cron-выражение. Попробуйте ещё раз.",
    description: "Сообщение о неверном cron-выражении",
  },
  {
    key: "broadcast.schedule.custom.invalid",
    locale: "en",
    value: "❌ Invalid cron expression. Please try again.",
    description: "Invalid cron expression message",
  },
  {
    key: "broadcast.schedule.success",
    locale: "ru",
    value: "✅ Рассылка запланирована!",
    description: "Сообщение об успешном планировании",
  },
  {
    key: "broadcast.schedule.success",
    locale: "en",
    value: "✅ Broadcast scheduled!",
    description: "Broadcast scheduled success message",
  },

  // Рассылка - Статусы
  {
    key: "broadcast.status.draft",
    locale: "ru",
    value: "📝 Черновик",
    description: "Статус черновика рассылки",
  },
  {
    key: "broadcast.status.draft",
    locale: "en",
    value: "📝 Draft",
    description: "Broadcast draft status",
  },
  {
    key: "broadcast.status.sending",
    locale: "ru",
    value: "⏳ Отправляется",
    description: "Статус отправки рассылки",
  },
  {
    key: "broadcast.status.sending",
    locale: "en",
    value: "⏳ Sending",
    description: "Broadcast sending status",
  },
  {
    key: "broadcast.status.sent",
    locale: "ru",
    value: "✅ Отправлено",
    description: "Статус отправленной рассылки",
  },
  {
    key: "broadcast.status.sent",
    locale: "en",
    value: "✅ Sent",
    description: "Broadcast sent status",
  },
  {
    key: "broadcast.status.error",
    locale: "ru",
    value: "❌ Ошибка",
    description: "Статус ошибки рассылки",
  },
  {
    key: "broadcast.status.error",
    locale: "en",
    value: "❌ Error",
    description: "Broadcast error status",
  },

  // Рассылка - Списки
  {
    key: "broadcast.list.empty",
    locale: "ru",
    value: "📭 Рассылок пока нет",
    description: "Сообщение о пустом списке рассылок",
  },
  {
    key: "broadcast.list.empty",
    locale: "en",
    value: "📭 No broadcasts yet",
    description: "Empty broadcast list message",
  },

  // Общие кнопки
  {
    key: "common.back",
    locale: "ru",
    value: "⬅️ Назад",
    description: "Кнопка назад",
  },
  {
    key: "common.back",
    locale: "en",
    value: "⬅️ Back",
    description: "Back button",
  },
  {
    key: "common.cancel",
    locale: "ru",
    value: "❌ Отмена",
    description: "Кнопка отмены",
  },
  {
    key: "common.cancel",
    locale: "en",
    value: "❌ Cancel",
    description: "Cancel button",
  },
  {
    key: "common.confirm",
    locale: "ru",
    value: "✅ Подтвердить",
    description: "Кнопка подтверждения",
  },
  {
    key: "common.confirm",
    locale: "en",
    value: "✅ Confirm",
    description: "Confirm button",
  },
  {
    key: "common.skip",
    locale: "ru",
    value: "⏭️ Пропустить",
    description: "Кнопка пропуска",
  },
  {
    key: "common.skip",
    locale: "en",
    value: "⏭️ Skip",
    description: "Skip button",
  },
];

export default async function seedLocalization() {
  try {
    const existingLocalizations = await drizzle
      .select()
      .from(localization)
      .all();

    if (existingLocalizations.length > 0) {
      // Если данные уже есть, добавляем только новые переводы
      const existingKeys = new Set(
        existingLocalizations.map(item => `${item.key}-${item.locale}`),
      );

      const newLocalizations = initialLocalizationData.filter(
        item => !existingKeys.has(`${item.key}-${item.locale}`),
      );

      if (newLocalizations.length > 0) {
        await drizzle.insert(localization).values(newLocalizations).run();
        logger.info(
          `Added ${newLocalizations.length} new localization entries.`,
        );
      } else {
        logger.info("No new localization entries to add.");
      }
      return;
    }

    // Если данных нет вообще, добавляем все
    await drizzle.insert(localization).values(initialLocalizationData).run();

    logger.info(
      `Localization seeded successfully! Added ${initialLocalizationData.length} entries.`,
    );
  } catch (error) {
    logger.error("Error seeding localization data:", error);
    throw error;
  }
}
