import { LOCALIZATION_KEYS } from "@config/localization.config";
import { SupportedLocale } from "@core/db/interface";
import {
  getGroupedLocalizationByKey,
  getGroupedLocalizationWithPagination,
} from "@core/db/models";
import logger from "@core/utils/logger";
import { InlineKeyboard } from "grammy";

import { Context } from "../core/interface/Context";
import { createPagination, ParamsExtractorDB } from "../core/utils";

const ADMIN_CONTENT_EDIT_KEY = "admin_content_edit";
const ADMIN_CONTENT_EDIT_START_KEY = "admin_content_edit_start";
export const ADMIN_CONTENT_EDIT_WAIT_KEY = "admin_content_edit_wait";
const ADMIN_CONTENT_KEY = "admin_content";
const ADMIN_BACK_KEY = "admin_back";

async function adminContent(ctx: Context) {
  const params = ctx.paramsExtractor?.params ?? {};
  const page = parseInt(params?.page ?? "1");
  const limit = 5;
  const offset = (page - 1) * limit;

  const translations = await ctx.tm([
    LOCALIZATION_KEYS.ADMIN_MENU_CONTENT,
    LOCALIZATION_KEYS.BUTTON_BACK,
    LOCALIZATION_KEYS.BUTTON_REFRESH,
  ]);

  try {
    const { data: contentItems, total } =
      await getGroupedLocalizationWithPagination(ctx.locale, { limit, offset });

    const totalPages = Math.ceil(total / limit);

    const keyboard = new InlineKeyboard();

    const paramInstances = contentItems.map(item => {
      const params = new ParamsExtractorDB(ADMIN_CONTENT_EDIT_KEY);
      params.addParams({ key: item.key, page });
      return params;
    });

    const callbackDataStrings =
      await ParamsExtractorDB.createManyAsync(paramInstances);

    for (const [index, item] of contentItems.entries()) {
      const callbackData = callbackDataStrings[index];

      const buttonText =
        item.description && item.description.length > 0
          ? item.description
          : item.key;
      keyboard.text(buttonText, callbackData).row();
    }

    await createPagination({
      page,
      count: totalPages,
      route: ADMIN_CONTENT_KEY,
      menu: keyboard,
      params,
    });

    keyboard.text(translations[LOCALIZATION_KEYS.BUTTON_BACK], ADMIN_BACK_KEY);

    const title = `${translations[LOCALIZATION_KEYS.ADMIN_MENU_CONTENT]}\n${page} / ${totalPages}`;

    await ctx.answerCallbackQuery();
    await ctx.editMessageText(title, {
      reply_markup: keyboard,
    });
  } catch (error) {
    if (error instanceof Error) logger.error(error.message);

    const keyboard = new InlineKeyboard();
    const params = new ParamsExtractorDB(ADMIN_CONTENT_KEY);
    params.addParams({ page });

    keyboard
      .text(
        translations[LOCALIZATION_KEYS.BUTTON_REFRESH],
        await params.toStringAsync(),
      )
      .row()
      .text(translations[LOCALIZATION_KEYS.BUTTON_BACK], "admin_back");

    await ctx.answerCallbackQuery();
    await ctx.editMessageText(
      `${translations[LOCALIZATION_KEYS.ADMIN_MENU_CONTENT]}\nОшибка при загрузке данных`,
      {
        reply_markup: keyboard,
      },
    );
  }
}

const mapLocaleToFlag: Record<SupportedLocale, string> = {
  ru: "🇷🇺 Русский",
  en: "🇺🇸 English",
};

async function adminContentEdit(ctx: Context) {
  await ctx.answerCallbackQuery();
  const key = ctx.paramsExtractor?.params.key;
  const page = ctx.paramsExtractor?.params.page;

  const translations = await ctx.tm([
    LOCALIZATION_KEYS.BUTTON_BACK,
    LOCALIZATION_KEYS.ADMIN_CONTENT_EDIT,
  ]);

  try {
    const keyboard = new InlineKeyboard();

    const params = new ParamsExtractorDB(ADMIN_CONTENT_KEY);
    params.addParams({ page });
    keyboard.text(
      translations[LOCALIZATION_KEYS.BUTTON_BACK],
      await params.toStringAsync({ isCleanParams: false }),
    );

    if (!key) throw new Error("Key is not defined");

    const contentItems = await getGroupedLocalizationByKey(key);
    const keysLocales = Object.keys(contentItems) as SupportedLocale[];

    let content = "";

    for (const locale of keysLocales) {
      content += `\n${mapLocaleToFlag[locale]}\n${contentItems[locale].map(i => `- ${i.value}`).join("\n")}\n`;
    }

    const changeKeyboard = new InlineKeyboard();

    // Создаем массив параметров для всех локалей
    const localeParamInstances = keysLocales.map(locale => {
      const params = new ParamsExtractorDB(ADMIN_CONTENT_EDIT_START_KEY);
      params.addParams({
        id: contentItems[locale][0].id,
        key,
        locale,
      });
      return params;
    });

    const localeCallbackDataStrings =
      await ParamsExtractorDB.createManyAsync(localeParamInstances);

    for (const [index, locale] of keysLocales.entries()) {
      const callbackData = localeCallbackDataStrings[index];
      changeKeyboard.text(mapLocaleToFlag[locale], callbackData).row();
    }

    changeKeyboard.text(
      translations[LOCALIZATION_KEYS.BUTTON_BACK],
      await params.toStringAsync(),
    );

    await ctx.editMessageText(
      `${translations[LOCALIZATION_KEYS.ADMIN_CONTENT_EDIT]}\nКлюч: ${key}\n${content}`,
      {
        reply_markup: changeKeyboard,
      },
    );
  } catch {
    const keyboard = new InlineKeyboard();

    const params = new ParamsExtractorDB(ADMIN_CONTENT_KEY);
    params.addParams({ page });
    keyboard.text(
      translations[LOCALIZATION_KEYS.BUTTON_BACK],
      await params.toStringAsync({ isCleanParams: false }),
    );

    await ctx.editMessageText(
      `${translations[LOCALIZATION_KEYS.ADMIN_CONTENT_EDIT]}\nОшибка: не указан ключ элемента`,
      {
        reply_markup: keyboard,
      },
    );
  }
}

async function adminContentEditStart(ctx: Context) {
  const idParam = ctx.paramsExtractor?.params?.id;
  const localeParam = ctx.paramsExtractor?.params?.locale;
  const id = idParam ? Number(idParam) : undefined;
  const locale = localeParam as SupportedLocale | undefined;
  const key = ctx.paramsExtractor?.params?.key;

  if (!id || Number.isNaN(id) || !locale || !key) {
    await ctx.editAndReply.reply(
      "Не удалось определить элемент для редактирования",
    );
    return;
  }

  await ctx.sessionSet?.({
    route: ADMIN_CONTENT_EDIT_WAIT_KEY,
    data: { id, locale, key },
    ttlSec: 5 * 60,
  });

  await ctx.answerCallbackQuery();
  await ctx.editAndReply.reply(
    `Отправьте новое значение для ${key} - ${mapLocaleToFlag[locale]}\n/cancel — отменить действие`,
  );
}

export default {
  [ADMIN_CONTENT_KEY]: adminContent,
  [ADMIN_CONTENT_EDIT_KEY]: adminContentEdit,
  [ADMIN_CONTENT_EDIT_START_KEY]: adminContentEditStart,
};
