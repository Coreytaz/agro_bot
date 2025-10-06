import { LocalizationKey } from "@core/db/interface";

export interface Localization {
  t: (key: LocalizationKey, targetLocale?: string) => Promise<string>;
  tm: (
    keys: LocalizationKey[],
    targetLocale?: string,
  ) => Promise<Record<LocalizationKey, string>>;
  locale: string;
}
