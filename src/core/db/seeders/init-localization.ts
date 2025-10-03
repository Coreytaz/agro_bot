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

    for (const localizationData of initialLocalizationData) {
      await drizzle.insert(localization).values(localizationData).run();
    }

    logger.info(
      `Localization seeded successfully! Added ${initialLocalizationData.length} entries.`,
    );
  } catch (error) {
    logger.error("Error seeding localization data:", error);
    throw error;
  }
}
