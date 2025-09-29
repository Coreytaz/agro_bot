import { drizzle } from "@core/db";
import { permissionRules, permissions, rules } from "@core/db/models";
import { isEmpty } from "@core/utils/isEmpty";
import logger from "@core/utils/logger";
import { and, desc, eq, isNull, or } from "drizzle-orm";
import { NextFunction } from "grammy";

import { Context } from "../interface/Context";
import { ErrorBot } from "../utils";

const reduceRules = (_rules: (typeof rules.$inferSelect)[]) => {
  return _rules.reduce<Record<string, typeof rules.$inferSelect>>(
    (acc, rule) => {
      if (rule.route !== null) {
        acc[rule.route] = rule;
      }
      return acc;
    },
    {},
  );
};

export default async function permissionsCheck(
  ctx: Context,
  next: NextFunction,
) {
  try {
    const roleId = ctx.role.id;
    const chatDB = ctx.chatDB;

    const permission = await drizzle.transaction(async tx => {
      const permissionResult = await tx
        .select({
          permission: permissions,
          rules: rules,
        })
        .from(permissions)
        .where(
          or(
            and(
              eq(permissions.roleId, roleId),
              eq(permissions.chatId, chatDB.chatId),
              eq(permissions.chatType, ctx.chatType.id),
            ),
            and(
              eq(permissions.roleId, roleId),
              isNull(permissions.chatId),
              eq(permissions.chatType, ctx.chatType.id),
            ),
          ),
        )
        .leftJoin(
          permissionRules,
          eq(permissionRules.permissionId, permissions.id),
        )
        .leftJoin(rules, eq(rules.id, permissionRules.ruleId))
        .orderBy(desc(permissions.chatId))
        .all();

      if (isEmpty(permissionResult)) {
        return null;
      }

      const grouped = permissionResult.reduce(
        (acc, row) => {
          // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
          if (!acc.permission) {
            acc.permission = row.permission;
            acc.rules = [];
          }
          if (row.rules) {
            acc.rules.push(row.rules);
          }
          return acc;
        },
        {} as {
          permission: typeof permissions.$inferSelect;
          rules: (typeof rules.$inferSelect)[];
        },
      );

      return grouped;
    });

    if (!permission) {
      throw new ErrorBot("Нет прав доступа!", ctx, true);
    }

    ctx.configUser = permission.permission;
    ctx.rules = reduceRules(permission.rules);

    if (!permission.permission.enable) {
      throw new ErrorBot("Нет прав доступа!", ctx, true);
    }

    await next();
    return;
  } catch (error) {
    if (error instanceof ErrorBot) {
      logger.error(error.message);
    }
  }
}
