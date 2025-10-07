import { LOCALIZATION_KEYS } from "@config/localization.config";
import { drizzle } from "@core/db";
import {
  chatTG,
  findAndCountAllChatTG,
  getAllRoles,
  getOneChatTG,
  getOneRole,
  getOneTypeTG,
  RoleType,
  updateOneChatTG,
} from "@core/db/models";
import {
  createUserBan,
  getActiveChatBan,
  updateOneUserBan,
} from "@core/db/models/userBan.models";
import logger from "@core/utils/logger";
import { inArray } from "drizzle-orm";
import { InlineKeyboard } from "grammy";

import { Context } from "../core/interface/Context";
import { createPagination, ParamsExtractorDB } from "../core/utils";
import { ADMIN_BACK_KEY } from "./admin-back";

function formatField(title: string, value: any): string {
  if (value === null || value === undefined || value === "") {
    return "";
  }
  return `${title}: ${value}`;
}

function formatUserInfo(fields: { title: string; value: any }[]): string {
  return fields
    .map(({ title, value }) => formatField(title, value))
    .filter(line => line !== "")
    .join("\n");
}

const ADMIN_USERS_KEY = "admin_users";
const ADMIN_USERS_DETAIL_KEY = "admin_users_detail";
const ADMIN_USER_BAN_KEY = "admin_user_ban";
const ADMIN_USER_UNBAN_KEY = "admin_user_unban";
const ADMIN_USER_INFO_KEY = "admin_user_info";
const ADMIN_USER_ROLE_KEY = "admin_user_role";

async function adminUsers(ctx: Context) {
  const params = ctx.paramsExtractor?.params ?? {};
  const page = parseInt(params?.page ?? "1");
  const limit = 5;
  const offset = (page - 1) * limit;

  const translations = await ctx.tm([
    LOCALIZATION_KEYS.ADMIN_MENU_USERS,
    LOCALIZATION_KEYS.BUTTON_BACK,
    LOCALIZATION_KEYS.BUTTON_REFRESH,
  ]);

  try {
    const { data: chatsTG, total } = await findAndCountAllChatTG(
      {},
      {
        offset,
        limit,
      },
    );

    const totalPages = Math.ceil(total / limit);

    const keyboard = new InlineKeyboard();

    const userParamInstances = chatsTG.map(chatTg => {
      const params = new ParamsExtractorDB(ADMIN_USERS_DETAIL_KEY);
      params.addParams({ chatId: chatTg.chatId, page });
      return params;
    });

    const userCallbackDataStrings =
      await ParamsExtractorDB.createManyAsync(userParamInstances);

    for (const [index, chatTg] of chatsTG.entries()) {
      const callbackData = userCallbackDataStrings[index];
      keyboard
        .text("ID:" + chatTg.chatId + " - (" + chatTg.name + ")", callbackData)
        .row();
    }

    await createPagination({
      page,
      count: totalPages,
      route: ADMIN_USERS_KEY,
      menu: keyboard,
      params,
    });

    keyboard
      .text(translations[LOCALIZATION_KEYS.BUTTON_BACK], ADMIN_BACK_KEY)
      .row();

    const title = `${translations[LOCALIZATION_KEYS.ADMIN_MENU_USERS]}\n${page} / ${totalPages}`;

    await ctx.answerCallbackQuery();
    await ctx.editMessageText(title, {
      reply_markup: keyboard,
    });
  } catch (error) {
    if (error instanceof Error) logger.error(error.message);

    const keyboard = new InlineKeyboard();
    const params = new ParamsExtractorDB(ADMIN_USERS_KEY);
    params.addParams({ page });

    // Создаем параметры для кнопки обновления
    const refreshCallbackData = await params.toStringAsync();

    keyboard
      .text(translations[LOCALIZATION_KEYS.BUTTON_REFRESH], refreshCallbackData)
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

const detailMenuConfig = [
  {
    localizationKey: LOCALIZATION_KEYS.ADMIN_USER_DETAIL_BUTTON_ROLE,
    callbackQuery: ADMIN_USER_ROLE_KEY,
  },
  {
    localizationKey: LOCALIZATION_KEYS.ADMIN_USER_DETAIL_BUTTON_INFO,
    callbackQuery: ADMIN_USER_INFO_KEY,
  },
];

async function adminUserDetail(ctx: Context) {
  const params = ctx.paramsExtractor?.params ?? {};
  const chatId = params?.chatId;
  const page = params?.page;

  const translations = await ctx.tm([
    LOCALIZATION_KEYS.BUTTON_BACK,
    LOCALIZATION_KEYS.ADMIN_USER_DETAIL_TITLE,
    LOCALIZATION_KEYS.ADMIN_USER_DETAIL_BUTTON_ROLE,
    LOCALIZATION_KEYS.ADMIN_USER_DETAIL_BUTTON_INFO,
    LOCALIZATION_KEYS.ADMIN_USER_DETAIL_BUTTON_BAN,
    LOCALIZATION_KEYS.ADMIN_USER_DETAIL_BUTTON_UNBAN,
  ]);

  try {
    if (!chatId) throw new Error("chatId is not defined");

    const { chatTG, role } = await drizzle.transaction(async tx => {
      const chatTG = await getOneChatTG({ chatId }, { ctx: tx });
      const role = await getOneRole({ id: chatTG?.roleId }, { ctx: tx });
      return { chatTG, role };
    });

    if (!chatTG) throw new Error("Chat not found");

    const keyboard = new InlineKeyboard();

    const userParamInstances = detailMenuConfig.map(({ callbackQuery }) => {
      const params = new ParamsExtractorDB(callbackQuery);
      params.addParam("chatId", chatTG.chatId);
      return params;
    });

    const userCallbackDataStrings =
      await ParamsExtractorDB.createManyAsync(userParamInstances);

    for (const [index, { localizationKey }] of detailMenuConfig.entries()) {
      const callbackData = userCallbackDataStrings[index];
      keyboard.text(translations[localizationKey], callbackData).row();
    }

    const activeBan = await getActiveChatBan(chatTG.chatId);

    if (activeBan) {
      const unbanParams = new ParamsExtractorDB(ADMIN_USER_UNBAN_KEY);
      unbanParams.addParams({ chatId: chatTG.chatId, page });
      keyboard
        .text(
          translations[LOCALIZATION_KEYS.ADMIN_USER_DETAIL_BUTTON_UNBAN],
          await unbanParams.toStringAsync(),
        )
        .row();
    } else {
      const banParams = new ParamsExtractorDB(ADMIN_USER_BAN_KEY);
      banParams.addParams({ chatId: chatTG.chatId, page });

      keyboard
        .text(
          translations[LOCALIZATION_KEYS.ADMIN_USER_DETAIL_BUTTON_BAN],
          await banParams.toStringAsync(),
        )
        .row();
    }

    const paramsBack = new ParamsExtractorDB(ADMIN_USERS_KEY);
    paramsBack.addParams({ page });
    keyboard.text(
      translations[LOCALIZATION_KEYS.BUTTON_BACK],
      await paramsBack.toStringAsync(),
    );

    await ctx.answerCallbackQuery();

    const userInfo = formatUserInfo([
      { title: "Name", value: chatTG.name },
      { title: "Role", value: role?.name },
    ]);

    await ctx.editMessageText(
      `${translations[LOCALIZATION_KEYS.ADMIN_USER_DETAIL_TITLE]}\n${userInfo}`,
      {
        reply_markup: keyboard,
      },
    );
  } catch (error) {
    if (error instanceof Error) {
      logger.error(error.message);

      const keyboard = new InlineKeyboard();

      const params = new ParamsExtractorDB(ADMIN_USERS_KEY);
      params.addParams({ page });
      keyboard.text(
        translations[LOCALIZATION_KEYS.BUTTON_BACK],
        await params.toStringAsync({ isCleanParams: false }),
      );

      await ctx.editMessageText(
        `${translations[LOCALIZATION_KEYS.ADMIN_USER_DETAIL_TITLE]}\nОшибка: ${error.message}`,
        {
          reply_markup: keyboard,
        },
      );
    }
  }
}

async function adminUserBan(ctx: Context) {
  const params = ctx.paramsExtractor?.params ?? {};
  const chatId = params?.chatId;

  const translations = await ctx.tm([
    LOCALIZATION_KEYS.BUTTON_BACK,
    LOCALIZATION_KEYS.USER_BANNED,
    LOCALIZATION_KEYS.ALREADY_BANNED,
  ]);

  try {
    if (!chatId) throw new Error("chatId is not defined");

    const chatTG = await getOneChatTG({ chatId });
    if (!chatTG) throw new Error("Chat not found");

    const existingBan = await getActiveChatBan(chatId);
    if (existingBan) {
      await ctx.answerCallbackQuery({
        text: translations[LOCALIZATION_KEYS.ALREADY_BANNED],
        show_alert: true,
      });
      return;
    }

    await createUserBan({
      targetId: chatId,
      targetType: "chat",
      chatId,
      reason: "Заблокирован администратором",
      bannedByAdminId: ctx.chatDB.chatId,
    });

    await ctx.answerCallbackQuery({
      text: translations[LOCALIZATION_KEYS.USER_BANNED],
    });

    await adminUserDetail(ctx);
  } catch (error) {
    if (error instanceof Error) {
      logger.error(error.message);
    }
    await ctx.answerCallbackQuery({
      text: "Ошибка при блокировке пользователя",
      show_alert: true,
    });
  }
}

async function adminUserUnban(ctx: Context) {
  const params = ctx.paramsExtractor?.params ?? {};
  const chatId = params?.chatId;

  const translations = await ctx.tm([
    LOCALIZATION_KEYS.BUTTON_BACK,
    LOCALIZATION_KEYS.USER_UNBANNED,
    LOCALIZATION_KEYS.NOT_BANNED,
  ]);

  try {
    if (!chatId) throw new Error("chatId is not defined");

    const chatTG = await getOneChatTG({ chatId });
    if (!chatTG) throw new Error("Chat not found");

    const activeBan = await getActiveChatBan(chatId);
    if (!activeBan) {
      await ctx.answerCallbackQuery({
        text: translations[LOCALIZATION_KEYS.NOT_BANNED],
        show_alert: true,
      });
      return;
    }

    await updateOneUserBan({ isActive: 0 }, { id: activeBan.id });

    await ctx.answerCallbackQuery({
      text: translations[LOCALIZATION_KEYS.USER_UNBANNED],
    });

    await adminUserDetail(ctx);
  } catch (error) {
    if (error instanceof Error) {
      logger.error(error.message);
    }
    await ctx.answerCallbackQuery({
      text: "Ошибка при разблокировке пользователя",
      show_alert: true,
    });
  }
}

async function adminUserInfo(ctx: Context) {
  const params = ctx.paramsExtractor?.params ?? {};
  const chatId = params?.chatId;
  const page = params?.page;

  const translations = await ctx.tm([
    LOCALIZATION_KEYS.BUTTON_BACK,
    LOCALIZATION_KEYS.ADMIN_USER_DETAIL_BUTTON_INFO,
  ]);

  try {
    if (!chatId) throw new Error("chatId is not defined");

    const { chatTG, role, chatType } = await drizzle.transaction(async tx => {
      const chatTG = await getOneChatTG({ chatId }, { ctx: tx });
      const role = await getOneRole({ id: chatTG?.roleId }, { ctx: tx });
      const chatType = await getOneTypeTG({ id: chatTG?.typeId }, { ctx: tx });

      return { chatTG, role, chatType };
    });

    if (!chatTG) throw new Error("Chat not found");

    const keyboard = new InlineKeyboard();

    const paramsBack = new ParamsExtractorDB(ADMIN_USERS_DETAIL_KEY);
    paramsBack.addParams({ chatId: chatTG.chatId, page });
    keyboard.text(
      translations[LOCALIZATION_KEYS.BUTTON_BACK],
      await paramsBack.toStringAsync(),
    );
    await ctx.answerCallbackQuery();

    const userName =
      chatType?.name === "private" ? `@${chatTG.name}` : chatTG.name;

    const userInfo = formatUserInfo([
      { title: "System ID", value: chatTG.id },
      { title: "Name", value: userName },
      { title: "Chat ID", value: chatTG.chatId },
      { title: "Role", value: role?.name },
      { title: "Type", value: chatType?.name },
      { title: "Created At", value: chatTG.created_at },
      { title: "Updated At", value: chatTG.updated_at },
    ]);

    await ctx.editMessageText(
      `${translations[LOCALIZATION_KEYS.ADMIN_USER_DETAIL_BUTTON_INFO]}\n${userInfo}`,
      {
        reply_markup: keyboard,
      },
    );
  } catch (error) {
    if (error instanceof Error) {
      logger.error(error.message);

      const keyboard = new InlineKeyboard();

      const params = new ParamsExtractorDB(ADMIN_USERS_DETAIL_KEY);
      params.addParams({ page });
      keyboard.text(
        translations[LOCALIZATION_KEYS.BUTTON_BACK],
        await params.toStringAsync({ isCleanParams: false }),
      );

      await ctx.editMessageText(
        `${translations[LOCALIZATION_KEYS.ADMIN_USER_DETAIL_BUTTON_INFO]}\nОшибка: ${error.message}`,
        {
          reply_markup: keyboard,
        },
      );
    }
  }
}

const ROLE_PERMISSIONS: Record<RoleType, number[]> = {
  admin: [],
  guest: [3],
  user: [2, 3],
  moderator: [2, 3, 4],
} as const;

const getWhereFilterRole = (
  currentUserRoleName: keyof typeof ROLE_PERMISSIONS,
) => {
  const permissions = ROLE_PERMISSIONS[currentUserRoleName];

  if (!(permissions.length > 0)) return undefined;

  return inArray(chatTG.roleId, permissions);
};

async function adminUserRole(ctx: Context) {
  const params = ctx.paramsExtractor?.params ?? {};
  const chatId = params?.chatId;
  const page = params?.page;
  const roleId = params?.roleId;

  const translations = await ctx.tm([
    LOCALIZATION_KEYS.BUTTON_BACK,
    LOCALIZATION_KEYS.ADMIN_USER_DETAIL_BUTTON_ROLE,
    LOCALIZATION_KEYS.ADMIN_USER_ROLE_CURRENT,
    LOCALIZATION_KEYS.ADMIN_USER_ROLE_SELECT,
  ]);

  try {
    if (!roleId) throw new Error();
    await updateOneChatTG({ roleId }, { chatId });
    await ctx.answerCallbackQuery("✅ Роль изменена");
  } catch (error) {
    if (error instanceof Error) {
      await ctx.answerCallbackQuery(error.message);
    }
  }

  try {
    if (!chatId) throw new Error("chatId is not defined");

    const { chatTG, role, roles } = await drizzle.transaction(async tx => {
      const chatTG = await getOneChatTG({ chatId }, { ctx: tx });
      const role = await getOneRole({ id: chatTG?.roleId }, { ctx: tx });
      const roles = await getAllRoles(
        {},
        { ctx: tx },
        getWhereFilterRole(ctx.role.name),
      );

      return { chatTG, role, roles };
    });

    if (!chatTG) throw new Error("Chat not found");
    if (!role) throw new Error("Role not found");
    if (roles.length === 0) throw new Error("No roles available");

    const keyboard = new InlineKeyboard();

    const roleParamInstances = roles.map(({ id }) => {
      const params = new ParamsExtractorDB(ADMIN_USER_ROLE_KEY);
      params.addParams({ chatId: chatId, page, roleId: id });
      return params;
    });

    const roleCallbackDataStrings =
      await ParamsExtractorDB.createManyAsync(roleParamInstances);

    for (const [index, role] of roles.entries()) {
      const callbackData = roleCallbackDataStrings[index];
      keyboard.text(role.name, callbackData).row();
    }

    const paramsBack = new ParamsExtractorDB(ADMIN_USERS_DETAIL_KEY);
    paramsBack.addParams({ page, chatId });
    keyboard.text(
      translations[LOCALIZATION_KEYS.BUTTON_BACK],
      await paramsBack.toStringAsync(),
    );

    await ctx.answerCallbackQuery();
    await ctx.editMessageText(
      `${translations[LOCALIZATION_KEYS.ADMIN_USER_DETAIL_BUTTON_ROLE]}\n${translations[LOCALIZATION_KEYS.ADMIN_USER_ROLE_CURRENT]}: ${role.name}\n${translations[LOCALIZATION_KEYS.ADMIN_USER_ROLE_SELECT]}`,
      {
        reply_markup: keyboard,
      },
    );
  } catch (error) {
    if (error instanceof Error) {
      logger.error(error.message);

      const keyboard = new InlineKeyboard();

      const params = new ParamsExtractorDB(ADMIN_USERS_DETAIL_KEY);
      params.addParams({ page });
      keyboard.text(
        translations[LOCALIZATION_KEYS.BUTTON_BACK],
        await params.toStringAsync({ isCleanParams: false }),
      );

      await ctx.editMessageText(
        `${translations[LOCALIZATION_KEYS.ADMIN_USER_DETAIL_BUTTON_ROLE]}\nОшибка: ${error.message}`,
        {
          reply_markup: keyboard,
        },
      );
    }
  }
}

export default {
  [ADMIN_USERS_KEY]: adminUsers,
  [ADMIN_USERS_DETAIL_KEY]: adminUserDetail,
  [ADMIN_USER_BAN_KEY]: adminUserBan,
  [ADMIN_USER_UNBAN_KEY]: adminUserUnban,
  [ADMIN_USER_INFO_KEY]: adminUserInfo,
  [ADMIN_USER_ROLE_KEY]: adminUserRole,
};
