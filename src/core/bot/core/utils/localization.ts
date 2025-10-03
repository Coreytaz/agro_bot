import { localizationConfig } from "@config/localization.config";
import { LocalizationKey } from "@core/db/interface";
import { getLocalizationByKey } from "@core/db/models";
import logger from "@core/utils/logger";

export interface LocalizationService {
  translate(key: string, locale?: string): Promise<string>;
}

class LocalizationServiceImpl implements LocalizationService {
  /**
   * Получает перевод для указанного ключа и локаль
   * Fallback логика: указанная локаль -> дефолтная локаль -> datapath (ключ)
   */
  async translate(
    key: LocalizationKey,
    locale = localizationConfig.defaultLocale,
  ): Promise<string> {
    try {
      let localization = await getLocalizationByKey(key, locale);

      if (!localization && locale !== localizationConfig.defaultLocale) {
        localization = await getLocalizationByKey(
          key,
          localizationConfig.defaultLocale,
        );
      }

      if (!localization) return `[${key}]`;

      return localization.value;
    } catch (error) {
      logger.error(`Localization error for key "${key}":`, error);
      return `[${key}]`;
    }
  }
}

export const localizationService = new LocalizationServiceImpl();
