import {
  LOCALIZATION_KEYS,
  localizationConfig,
} from "@config/localization.config";

export type LocalizationKey =
  (typeof LOCALIZATION_KEYS)[keyof typeof LOCALIZATION_KEYS];

export type SupportedLocale =
  (typeof localizationConfig)["supportedLocales"][number];
