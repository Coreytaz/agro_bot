import { InlineKeyboard } from "grammy";

import { ParamsExtractorDB } from "./paramsExtractorDB";

export interface Pagination {
  page: number;
  count: number;
}

const mapNumber: Record<string, string> = {
  "1": "1️⃣",
  "2": "2️⃣",
  "3": "3️⃣",
  "4": "4️⃣",
  "5": "5️⃣",
  "6": "6️⃣",
  "7": "7️⃣",
  "8": "8️⃣",
  "9": "9️⃣",
  "0": "0️⃣",
};

function range(start: number, end: number): number[] {
  if (start >= end) {
    return [];
  }

  return [...Array(end - start + 1).keys()].map(
    (key: number): number => key + start,
  );
}

const convertNumberToEmoji = (number: number): string => {
  const str = String(number)
    .split("")
    .map(item => mapNumber[item] || item)
    .join("");
  return str;
};

export const createPagination = async ({
  count,
  page,
  route,
  menu: _menu,
  params,
}: Pagination & { route: string; menu?: InlineKeyboard; params: any }) => {
  const menu = _menu ?? new InlineKeyboard();
  const prevPage = Math.max(page - 1, 1);
  const nextPage = Math.min(page + 1, count);
  const lastPage = Math.min(Math.max(page + 2, 5), count);
  const firstPage = Math.max(1, lastPage - 4);
  const _range = range(firstPage, lastPage);

  // Собираем все параметры для массового создания
  const paramsToCreate: {
    instance: ParamsExtractorDB;
    pageNum: number;
    type: "prev" | "next" | "page";
  }[] = [];

  // Добавляем параметры для кнопки "назад"
  if (page > 1) {
    const prevParams = new ParamsExtractorDB(route);
    prevParams.addParams(params);
    prevParams.addParam("page", String(prevPage));
    paramsToCreate.push({
      instance: prevParams,
      pageNum: prevPage,
      type: "prev",
    });
  }

  // Добавляем параметры для кнопок страниц
  for (const item of _range) {
    if (page !== item) {
      const pageParams = new ParamsExtractorDB(route);
      pageParams.addParams(params);
      pageParams.addParam("page", String(item));
      paramsToCreate.push({
        instance: pageParams,
        pageNum: item,
        type: "page",
      });
    }
  }

  // Добавляем параметры для кнопки "вперед"
  if (page < lastPage) {
    const nextParams = new ParamsExtractorDB(route);
    nextParams.addParams(params);
    nextParams.addParam("page", String(nextPage));
    paramsToCreate.push({
      instance: nextParams,
      pageNum: nextPage,
      type: "next",
    });
  }

  // Массово создаем все записи одним запросом
  const callbackDataStrings = await ParamsExtractorDB.createManyAsync(
    paramsToCreate.map(p => p.instance),
  );

  // Создаем кнопки с готовыми callback_data
  let callbackIndex = 0;

  if (page > 1) {
    menu.text("◀", callbackDataStrings[callbackIndex]);
    callbackIndex++;
  }

  for (const item of _range) {
    if (page !== item) {
      menu.text(convertNumberToEmoji(item), callbackDataStrings[callbackIndex]);
      callbackIndex++;
    }
  }

  if (page < lastPage) {
    menu.text("▶", callbackDataStrings[callbackIndex]);
  }

  menu.row();
};
