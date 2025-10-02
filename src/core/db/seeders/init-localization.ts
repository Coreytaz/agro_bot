import logger from "@core/utils/logger";

import { drizzle } from "../drizzle";
import { localization, LocalizationKey } from "../models";

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
