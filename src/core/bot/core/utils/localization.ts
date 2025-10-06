import { localizationConfig } from "@config/localization.config";
import { LocalizationKey } from "@core/db/interface";
import { getLocalizationByKey, getLocalizationsByKeys } from "@core/db/models";
import logger from "@core/utils/logger";

export interface LocalizationService {
  translate(key: string, locale?: string): Promise<string>;
  translateMultiple(
    keys: LocalizationKey[],
    locale?: string,
  ): Promise<Record<string, string>>;
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

  /**
   * Получает переводы для массива ключей и группирует их в объект
   * Использует одну транзакцию вместо множественных запросов для повышения производительности
   * @param keys Массив ключей для перевода
   * @param locale Локаль для перевода (по умолчанию используется дефолтная)
   * @returns Объект с ключами и их переводами
   */
  async translateMultiple(
    keys: LocalizationKey[],
    locale = localizationConfig.defaultLocale,
  ): Promise<Record<string, string>> {
    try {
      if (keys.length === 0) {
        return {};
      }

      // Используем оптимизированный запрос через транзакцию
      return await getLocalizationsByKeys(keys, locale);
    } catch (error) {
      logger.error(
        `Multiple localization error for keys "${keys.join(", ")}":`,
        error,
      );

      // В случае ошибки возвращаем объект с ключами как значениями
      const fallbackTranslations: Record<string, string> = {};
      keys.forEach(key => {
        fallbackTranslations[key] = `[${key}]`;
      });

      return fallbackTranslations;
    }
  }
}

export const localizationService = new LocalizationServiceImpl();
