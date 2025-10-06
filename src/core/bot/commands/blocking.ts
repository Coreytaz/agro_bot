import { drizzle } from "@core/db";
import { getAllChatTG } from "@core/db/models";
import {
  getActiveChatBan,
  getActiveUserBan,
  updateOneUserBan,
  userBan,
} from "@core/db/models/userBan.models";
import logger from "@core/utils/logger";
import { Command } from "@grammyjs/commands";

import type { Context } from "../core/interface/Context";

const SEPARATOR = " ";

function parseArgs(
  args: string[],
  spec: ("required" | "optional")[],
): string[] | null {
  const result: string[] = [];
  let i = 0;
  for (const type of spec) {
    if (type === "required") {
      if (!args[i]) return null;
      result.push(args[i]);
      i++;
    } else {
      result.push(args[i] ?? "");
      i++;
    }
  }
  return result;
}

function buildHelp(
  usage: string,
  examples: string[],
  description?: string,
): string {
  // Экранируем угловые скобки для HTML
  const escape = (s: string) => s.replace(/</g, "&lt;").replace(/>/g, "&gt;");
  return (
    `❌ Неверный формат команды\n` +
    `<b>Использование:</b> <code>${escape(usage)}</code>\n` +
    `<b>Примеры:</b>\n` +
    examples.map(e => `• <code>${escape(e)}</code>`).join("\n") +
    (description ? `\n${description}` : "")
  );
}

export const banChatCommand = new Command<Context>(
  "banChat",
  "Заблокировать чат",
  async ctx => {
    const args = ctx.message?.text.split(SEPARATOR).slice(1) ?? [];
    const parsed = parseArgs(args, ["required", "optional", "optional"]);
    if (!parsed) {
      await ctx.reply(
        buildHelp(
          `/banChat <chatId> [время_в_минутах] [причина]`,
          [
            `/banChat 123456789`,
            `/banChat 123456789 60`,
            `/banChat 123456789 60 Спам`,
          ],
          "Бан на время — в минутах.",
        ),
        { parse_mode: "HTML" },
      );
      return;
    }
    const [targetChatId, timeStr, ...reasonArr] = args;
    const timeInMinutes =
      timeStr && !isNaN(Number(timeStr)) ? Number(timeStr) : null;
    const reason =
      (timeInMinutes ? reasonArr : [timeStr, ...reasonArr])
        .filter(Boolean)
        .join(SEPARATOR) || "Заблокирован администратором";
    try {
      const targetChat = await getAllChatTG({ chatId: targetChatId });
      if (targetChat.length === 0) {
        await ctx.reply("❌ Чат не найден в базе данных");
        return;
      }
      const chat = targetChat[0];
      const existingBan = await getActiveChatBan(targetChatId);
      if (existingBan) {
        await ctx.reply("❌ Этот чат уже заблокирован");
        return;
      }
      let expiresAt = null;
      if (timeInMinutes) {
        const expirationDate = new Date();
        expirationDate.setMinutes(expirationDate.getMinutes() + timeInMinutes);
        expiresAt = expirationDate.toISOString();
      }
      await drizzle.insert(userBan).values({
        targetId: targetChatId,
        targetType: "chat",
        chatId: targetChatId,
        reason,
        bannedByAdminId: String(ctx.from?.id),
        expiresAt,
        isActive: 1,
      });
      let banMessage = `✅ Чат ${chat.name} (${targetChatId}) заблокирован\n📝 Причина: ${reason}`;
      if (timeInMinutes) {
        banMessage += `\n⏰ Блокировка истечет через ${timeInMinutes} минут`;
      } else {
        banMessage += "\n♾️ Постоянная блокировка";
      }
      await ctx.reply(banMessage);
    } catch (error) {
      logger.error("Ошибка при блокировке чата:", error);
      await ctx.reply("❌ Произошла ошибка при блокировке чата");
    }
  },
);

export const unbanChatCommand = new Command<Context>(
  "unbanChat",
  "Разблокировать чат",
  async ctx => {
    const args = ctx.message?.text.split(SEPARATOR).slice(1) ?? [];
    const parsed = parseArgs(args, ["required"]);
    if (!parsed) {
      await ctx.reply(
        buildHelp(`/unbanChat <chatId>`, [`/unbanChat 123456789`]),
        { parse_mode: "HTML" },
      );
      return;
    }
    const [targetChatId] = args;
    try {
      const targetChat = await getAllChatTG({ chatId: targetChatId });
      if (targetChat.length === 0) {
        await ctx.reply("❌ Чат не найден в базе данных");
        return;
      }
      const chat = targetChat[0];
      const activeBan = await getActiveChatBan(targetChatId);
      if (!activeBan) {
        await ctx.reply("❌ Этот чат не заблокирован");
        return;
      }
      await updateOneUserBan({ isActive: 0 }, { id: activeBan.id });
      await ctx.reply(`✅ Чат ${chat.name} (${targetChatId}) разблокирован`);
    } catch (error) {
      logger.error("Ошибка при разблокировке чата:", error);
      await ctx.reply("❌ Произошла ошибка при разблокировке чата");
    }
  },
);

export const banUserCommand = new Command<Context>(
  "banUser",
  "Заблокировать пользователя временно или постоянно",
  async ctx => {
    const args = ctx.message?.text.split(SEPARATOR).slice(1) ?? [];
    const parsed = parseArgs(args, [
      "required",
      "required",
      "optional",
      "optional",
    ]);
    if (!parsed) {
      await ctx.reply(
        buildHelp(
          `/banUser <userId> <chatId> [время_в_минутах] [причина]`,
          [
            `/banUser 123456789 -1001234567890`,
            `/banUser 123456789 -1001234567890 60`,
            `/banUser 123456789 -1001234567890 60 Спам`,
          ],
          "Бан на время — в минутах.",
        ),
        { parse_mode: "HTML" },
      );
      return;
    }
    const [targetUserId, targetChatId, timeStr, ...reasonArr] = args;
    const timeInMinutes =
      timeStr && !isNaN(Number(timeStr)) ? Number(timeStr) : null;
    const reason =
      (timeInMinutes ? reasonArr : [timeStr, ...reasonArr])
        .filter(Boolean)
        .join(SEPARATOR) || "Заблокирован администратором";
    try {
      const existingBan = await getActiveUserBan(targetUserId, targetChatId);
      if (existingBan) {
        await ctx.reply("❌ Этот пользователь уже заблокирован в данном чате");
        return;
      }
      let expiresAt = null;
      if (timeInMinutes) {
        const expirationDate = new Date();
        expirationDate.setMinutes(expirationDate.getMinutes() + timeInMinutes);
        expiresAt = expirationDate.toISOString();
      }
      await drizzle.insert(userBan).values({
        targetId: targetUserId,
        targetType: "user",
        chatId: targetChatId,
        reason,
        bannedByAdminId: String(ctx.from?.id),
        expiresAt,
        isActive: 1,
      });
      let banMessage = `✅ Пользователь ${targetUserId} заблокирован в чате ${targetChatId}\n📝 Причина: ${reason}`;
      if (timeInMinutes) {
        banMessage += `\n⏰ Бан истечет через ${timeInMinutes} минут`;
      } else {
        banMessage += "\n♾️ Постоянный бан";
      }
      await ctx.reply(banMessage);
    } catch (error) {
      logger.error("Ошибка при блокировке пользователя:", error);
      await ctx.reply("❌ Произошла ошибка при блокировке пользователя");
    }
  },
);

export const unbanUserCommand = new Command<Context>(
  "unbanUser",
  "Разблокировать пользователя",
  async ctx => {
    const args = ctx.message?.text.split(SEPARATOR).slice(1) ?? [];
    const parsed = parseArgs(args, ["required"]);
    if (!parsed) {
      await ctx.reply(
        buildHelp(`/unbanUser <userId>`, [`/unbanUser 123456789`]),
        { parse_mode: "HTML" },
      );
      return;
    }
    const [targetUserId] = args;
    try {
      const activeBan = await getActiveUserBan(targetUserId, ctx.chatDB.chatId);
      if (!activeBan) {
        await ctx.reply("❌ Этот пользователь не заблокирован в данном чате");
        return;
      }
      await updateOneUserBan({ isActive: 0 }, { id: activeBan.id });
      await ctx.reply(`✅ Пользователь ${targetUserId} разблокирован`);
    } catch (error) {
      logger.error("Ошибка при разблокировке пользователя:", error);
      await ctx.reply("❌ Произошла ошибка при разблокировке пользователя");
    }
  },
);

export default {
  "/banChat": banChatCommand,
  "/unbanChat": unbanChatCommand,
  "/banUser": banUserCommand,
  "/unbanUser": unbanUserCommand,
};
