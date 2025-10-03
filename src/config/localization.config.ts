import config from "@config/config";

export const localizationConfig = {
  defaultLocale: config.defaultLocale,
  supportedLocales: ["ru", "en"],
} as const;

export const LOCALIZATION_KEYS = {
  MENU_TITLE: "menu.title",
  SETTINGS_TITLE: "settings.title",
  SETTINGS_LANGUAGE: "settings.language",
  SETTINGS_LANGUAGE_SELECT: "settings.language.select",
  SETTINGS_LANGUAGE_CHANGED: "settings.language.changed",
  LANGUAGE_RU: "language.ru",
  LANGUAGE_EN: "language.en",
  BUTTON_BACK: "button.back",
} as const;
