import { fmt, FormattedString } from "@grammyjs/parse-mode";

import type { TypeLogger } from "../interface/Logger";
import { semiSeparator } from "./semiSeparator";

export const createMsg = (
  type: TypeLogger,
  message: string | FormattedString,
) => {
  const boldType = FormattedString.bold(type.toUpperCase());
  return fmt`${semiSeparator} ${boldType} ${semiSeparator}\n${message}`;
};
