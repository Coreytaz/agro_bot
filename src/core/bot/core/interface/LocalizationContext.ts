import { LocalizationKey } from "@core/db/models";

export interface Localization {
  t: (key: LocalizationKey, targetLocale?: string) => Promise<string>;
  locale: string;
}
