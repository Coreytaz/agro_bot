import config from "@config/config";

export const localizationConfig = {
  defaultLocale: config.defaultLocale,
  supportedLocales: ["ru", "en"],
} as const;

export const LOCALIZATION_KEYS = {
  // Команды
  START_MESSAGE: "commands.start.message",

  MENU_TITLE: "menu.title",
  SETTINGS_TITLE: "settings.title",
  SETTINGS_LANGUAGE: "settings.language",
  SETTINGS_LANGUAGE_SELECT: "settings.language.select",
  SETTINGS_LANGUAGE_CHANGED: "settings.language.changed",
  LANGUAGE_RU: "language.ru",
  LANGUAGE_EN: "language.en",
  BUTTON_BACK: "button.back",
  
  // Админ панель
  ADMIN_MENU_TITLE: "admin.menu.title",
  ADMIN_MENU_CONTENT: "admin.menu.content",
  ADMIN_MENU_BROADCAST: "admin.menu.broadcast",
  ADMIN_MENU_MODEL_SETTINGS: "admin.menu.model.settings",
  ADMIN_MENU_STATISTICS: "admin.menu.statistics",
  ADMIN_MENU_USERS: "admin.menu.users",

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
} as const;
