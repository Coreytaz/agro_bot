import config from "@config/config";

export const localizationConfig = {
  defaultLocale: config.defaultLocale,
  supportedLocales: ["ru", "en"],
} as const;

export const LOCALIZATION_KEYS = {
  // Команды
  START_MESSAGE: "commands.start.message",
  MENU_MESSAGE: "commands.menu.message",

  // Кнопки меню
  MENU_BUTTON_DIAGNOSIS: "menu.button.diagnosis",
  MENU_BUTTON_KNOWLEDGE: "menu.button.knowledge",
  MENU_BUTTON_HELP: "menu.button.help",
  MENU_BUTTON_ABOUT: "menu.button.about",
  MENU_BUTTON_SETTINGS: "menu.button.settings",

  MENU_TITLE: "menu.title",
  ABOUT_MESSAGE: "about.message",
  HELP_MESSAGE: "help.message",
  SETTINGS_TITLE: "settings.title",
  SETTINGS_LANGUAGE: "settings.language",
  SETTINGS_NOTIFICATIONS: "settings.notifications",
  SETTINGS_NOTIFICATIONS_ON: "settings.notifications.on",
  SETTINGS_NOTIFICATIONS_OFF: "settings.notifications.off",
  SETTINGS_NOTIFICATIONS_ENABLED: "settings.notifications.enabled",
  SETTINGS_NOTIFICATIONS_DISABLED: "settings.notifications.disabled",
  SETTINGS_LANGUAGE_SELECT: "settings.language.select",
  SETTINGS_LANGUAGE_CHANGED: "settings.language.changed",
  LANGUAGE_RU: "language.ru",
  LANGUAGE_EN: "language.en",

  // Общие
  BUTTON_BACK: "button.back",
  BUTTON_REFRESH: "button.refresh",
  BUTTON_CANCEL: "button.cancel",
  
  // Админ панель
  ADMIN_MENU_TITLE: "admin.menu.title",
  ADMIN_MENU_CONTENT: "admin.menu.content",
  ADMIN_MENU_BROADCAST: "admin.menu.broadcast",
  ADMIN_MENU_MODEL_SETTINGS: "admin.menu.model.settings",
  ADMIN_MENU_STATISTICS: "admin.menu.statistics",
  ADMIN_MENU_USERS: "admin.menu.users",

  // Контент
  ADMIN_CONTENT_EDIT: "admin.content.edit",

  // Блокировки и баны
  CHAT_BLOCKED: "blocking.chat.blocked",
  CHAT_UNBLOCKED: "blocking.chat.unblocked",
  USER_BANNED: "blocking.user.banned",
  USER_UNBANNED: "blocking.user.unbanned",
  USER_BANNED_TEMPORARY: "blocking.user.banned.temporary",
  USER_BANNED_PERMANENT: "blocking.user.banned.permanent",
  BLOCKED_MESSAGE: "blocking.blocked.message",
  BANNED_MESSAGE: "blocking.banned.message",
  ACCESS_DENIED: "blocking.access.denied",
  INVALID_COMMAND_FORMAT: "blocking.command.invalid.format",
  CHAT_NOT_FOUND: "blocking.chat.not.found",
  USER_NOT_FOUND: "blocking.user.not.found",
  ALREADY_BLOCKED: "blocking.already.blocked",
  ALREADY_BANNED: "blocking.already.banned",
  NOT_BLOCKED: "blocking.not.blocked",
  NOT_BANNED: "blocking.not.banned",
  BAN_STATS_TITLE: "blocking.stats.title",
  BAN_STATS_ACTIVE: "blocking.stats.active",
  BAN_STATS_EXPIRED: "blocking.stats.expired",
  BAN_STATS_PERMANENT: "blocking.stats.permanent",
  BAN_STATS_TOTAL: "blocking.stats.total",
  BAN_LIST_TITLE: "blocking.list.title",
  BAN_LIST_EMPTY: "blocking.list.empty",
  OPERATION_SUCCESS: "common.operation.success",
  OPERATION_ERROR: "common.operation.error",

  // Детальная информации о пользователе
  ADMIN_USER_DETAIL_TITLE: "admin.user.detail.title",
  ADMIN_USER_DETAIL_BUTTON_ROLE: "admin.user.detail.button.role",
  ADMIN_USER_DETAIL_BUTTON_INFO: "admin.user.detail.button.info",
  ADMIN_USER_DETAIL_BUTTON_BAN: "admin.user.detail.button.ban",
  ADMIN_USER_DETAIL_BUTTON_UNBAN: "admin.user.detail.button.unban",

  // Роли
  ADMIN_USER_ROLE_CURRENT: "admin.user.role.current",
  ADMIN_USER_ROLE_SELECT: "admin.user.role.select",

  // Рассылка
  BROADCAST_MENU_TITLE: "broadcast.menu.title",
  BROADCAST_MENU_CREATE: "broadcast.menu.create",
  BROADCAST_MENU_LIST: "broadcast.menu.list",
  BROADCAST_MENU_DRAFTS: "broadcast.menu.drafts",
  BROADCAST_MENU_HISTORY: "broadcast.menu.history",
  BROADCAST_CREATE_TITLE: "broadcast.create.title",
  BROADCAST_CREATE_ENTER_TITLE: "broadcast.create.enter.title",
  BROADCAST_CREATE_ENTER_MESSAGE: "broadcast.create.enter.message",
  BROADCAST_CREATE_ENTER_IMAGE: "broadcast.create.enter.image",
  BROADCAST_CREATE_PREVIEW: "broadcast.create.preview",
  BROADCAST_CREATE_CONFIRM: "broadcast.create.confirm",
  BROADCAST_CREATE_SUCCESS: "broadcast.create.success",
  BROADCAST_SEND_CONFIRM: "broadcast.send.confirm",
  BROADCAST_SEND_PROGRESS: "broadcast.send.progress",
  BROADCAST_SEND_SUCCESS: "broadcast.send.success",
  BROADCAST_SEND_ERROR: "broadcast.send.error",
  BROADCAST_SEND_NOW: "broadcast.send.now",
  BROADCAST_SCHEDULE: "broadcast.schedule",
  BROADCAST_SCHEDULE_SELECT: "broadcast.schedule.select",
  BROADCAST_SCHEDULE_NOW: "broadcast.schedule.now",
  BROADCAST_SCHEDULE_DAILY: "broadcast.schedule.daily",
  BROADCAST_SCHEDULE_WEEKLY: "broadcast.schedule.weekly",
  BROADCAST_SCHEDULE_CUSTOM: "broadcast.schedule.custom",
  BROADCAST_SCHEDULE_CUSTOM_ENTER: "broadcast.schedule.custom.enter",
  BROADCAST_SCHEDULE_CUSTOM_INVALID: "broadcast.schedule.custom.invalid",
  BROADCAST_SCHEDULE_SUCCESS: "broadcast.schedule.success",
  BROADCAST_RECURRING_ON: "broadcast.recurring.on",
  BROADCAST_RECURRING_OFF: "broadcast.recurring.off",
  BROADCAST_RECURRING_ENABLED: "broadcast.recurring.enabled",
  BROADCAST_RECURRING_DISABLED: "broadcast.recurring.disabled",
  BROADCAST_LIST_EMPTY: "broadcast.list.empty",
  BROADCAST_STATUS_DRAFT: "broadcast.status.draft",
  BROADCAST_STATUS_SENDING: "broadcast.status.sending",
  BROADCAST_STATUS_SENT: "broadcast.status.sent",
  BROADCAST_STATUS_ERROR: "broadcast.status.error",

  COMMON_BACK: "common.back",
  COMMON_CANCEL: "common.cancel",
  COMMON_CONFIRM: "common.confirm",
  COMMON_SKIP: "common.skip",
} as const;
