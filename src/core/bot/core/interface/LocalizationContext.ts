import { LocalizationKey } from "@core/db/interface";

export interface Localization {
  t: (key: LocalizationKey, targetLocale?: string) => Promise<string>;
  locale: string;
}
