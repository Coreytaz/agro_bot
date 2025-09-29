import { fmt, FormattedString, Stringable } from "@grammyjs/parse-mode";

import {
  ParseObjectToHTMLOptions,
  ParseObjectToHTMLValue,
} from "../interface/ParseObjectToHTML";

const mapOptions: Record<
  keyof ParseObjectToHTMLOptions,
  | ((stringLike: Stringable) => FormattedString)
  | ((stringLike: Stringable, language: string) => FormattedString)
> = {
  bold: (text: Stringable) => FormattedString.bold(text),
  italic: (text: Stringable) => FormattedString.italic(text),
  underline: (text: Stringable) => FormattedString.underline(text),
  strikethrough: (text: Stringable) => FormattedString.strikethrough(text),
  spoiler: (text: Stringable) => FormattedString.spoiler(text),
  code: (text: Stringable) => FormattedString.code(text),
  pre: (text: Stringable, language: string) =>
    FormattedString.pre(text, language),
  expandableBlockquote: (text: Stringable) =>
    FormattedString.expandableBlockquote(text),
};

const applyOptions = (
  value: Stringable,
  options: ParseObjectToHTMLOptions,
): FormattedString => {
  return Object.entries(options).reduce<FormattedString>(
    (acc, [key, val]) => {
      if (val) {
        const formatter = mapOptions[key as keyof ParseObjectToHTMLOptions];
        if (key === "pre") {
          return (
            formatter as (
              stringLike: Stringable,
              language: string,
            ) => FormattedString
          )(acc, "");
        } else {
          return (formatter as (stringLike: Stringable) => FormattedString)(
            acc,
          );
        }
      }
      return acc;
    },
    fmt`${value}`,
  );
};

export const parseObjectToHTML = (
  obj: Record<string, ParseObjectToHTMLValue | undefined>,
) => {
  const parts = Object.values(obj)
    .filter(value => value)
    .map(value => {
      if (!value?.value) return fmt``;
      return fmt`${value.title}: ${applyOptions(value.value, value.options ?? {})}${value.separator?.() ?? "\n"}`;
    });

  return parts.reduce<FormattedString>(
    (acc, part, index) => {
      if (index === 0) return part;
      return fmt`${acc}${part}`;
    },
    fmt``,
  );
};
