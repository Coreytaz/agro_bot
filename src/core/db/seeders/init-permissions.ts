import logger from "@core/utils/logger";

import { drizzle } from "../drizzle";
import {
  type ChatType,
  getAllPermissionRules,
  getAllPermissions,
  getAllRoles,
  getAllRules,
  getAllTypeTG,
  permissionRules,
  permissions,
  type RoleType,
} from "../models";

const idCommand = {
  "/id": {
    enable: true,
  },
};

const cancelCommand = {
  "/cancel": {
    enable: true,
  },
};

const resetCommand = {
  "/reset": {
    enable: true,
  },
};

const startCommand = {
  "/start": {
    enable: true,
  },
};

const guestRules = Object.assign(
  {},
  idCommand,
  resetCommand,
  startCommand,
  cancelCommand,
);

const userRules = Object.assign({}, guestRules, {
  "/menu": {
    enable: true,
  },
});

const banRules = Object.assign({}, userRules, {
  "/blockChat": {
    enable: true,
  },
  "/unblockChat": {
    enable: true,
  },
  "/banUser": {
    enable: true,
  },
  "/unbanUser": {
    enable: true,
  },
  "/listBans": {
    enable: true,
  },
});

const moderatorPrivateRules = Object.assign({}, userRules, banRules);

const initPermissionConfig: Record<
  ChatType,
  {
    enable: boolean;
    role: Record<
      RoleType,
      { enable: boolean; commands: "*" | Record<string, { enable: boolean }> }
    >;
  }
> = {
  private: {
    enable: true,
    role: {
      admin: {
        enable: true,
        commands: "*",
      },
      moderator: {
        enable: true,
        commands: Object.assign({}, moderatorPrivateRules),
      },
      user: {
        enable: true,
        commands: Object.assign({}, userRules),
      },
      guest: {
        enable: true,
        commands: Object.assign({}, guestRules),
      },
    },
  },
  group: {
    enable: false,
    role: {
      admin: { enable: true, commands: "*" },
      moderator: { enable: false, commands: Object.assign({}) },
      user: { enable: false, commands: Object.assign({}) },
      guest: {
        enable: false,
        commands: Object.assign({}),
      },
    },
  },
  supergroup: {
    enable: true,
    role: {
      admin: { enable: true, commands: "*" },
      moderator: { enable: false, commands: Object.assign({}) },
      user: { enable: false, commands: Object.assign({}) },
      guest: {
        enable: false,
        commands: Object.assign({}),
      },
    },
  },
  channel: {
    enable: false,
    role: {
      admin: { enable: true, commands: "*" },
      moderator: { enable: false, commands: Object.assign({}) },
      user: { enable: false, commands: Object.assign({}) },
      guest: {
        enable: false,
        commands: Object.assign({}),
      },
    },
  },
};

const genKey = (...args: string[]) => args.join("_");

const generatePermissions = (
  config: Record<string, unknown> | ArrayLike<unknown>,
  roles: Record<string, any>,
  rules: Record<string, any>,
  type: Record<string, any>,
) => {
  const permission_rules: { permissionId: number; ruleId: any }[] = [];
  const permissions: Record<
    string,
    { id: number; chatType: number; roleId: any; chatId: any; enable: number }
  > = {};
  let count = 1;
  Object.entries(config).forEach(([chatType, value]) => {
    const current = value as { enable: boolean; role: Record<string, any> };
    Object.entries(current.role).forEach(([role, roleValue]) => {
      const key = genKey(chatType, role);
      permissions[key] ??= {
        id: count,
        chatType: type[chatType],
        roleId: roles[role],
        chatId: null,
        enable: current.enable && roleValue.enable ? 1 : 0,
      };
      if (roleValue.commands === "*") {
        const ruleId = rules[roleValue.commands];
        if (ruleId) {
          permission_rules.push({
            permissionId: count,
            ruleId,
          });
        }
      } else {
        Object.entries(roleValue.commands).forEach(
          ([command, commandValue]) => {
            if ((commandValue as { enable: boolean }).enable) {
              const ruleId = rules[command];
              if (ruleId) {
                permission_rules.push({
                  permissionId: count,
                  ruleId,
                });
              }
            }
          },
        );
      }
      count += 1;
    });
  });

  return { permissions: Object.values(permissions), permission_rules };
};

export default async function seedDefaultConfig() {
  try {
    const existingPermissions = await getAllPermissions({});
    const existingPermissionRules = await getAllPermissionRules({});

    if (existingPermissions.length > 0 || existingPermissionRules.length > 0) {
      logger.info(
        "existingPermissions | existingPermissionRules already exists, skipping seeding.",
      );
      return;
    }

    const roles = (await getAllRoles({})).reduce<Record<string, number>>(
      (acc, role) => {
        acc[role.name] = role.id;
        return acc;
      },
      {},
    );

    const type = (await getAllTypeTG({})).reduce<Record<string, number>>(
      (acc, role) => {
        acc[role.name] = role.id;
        return acc;
      },
      {},
    );

    const rules = (await getAllRules({})).reduce<Record<string, number>>(
      (acc, rule) => {
        if (rule.route !== null) {
          acc[rule.route] = rule.id;
        }
        return acc;
      },
      {},
    );

    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    if (!roles || !rules) {
      logger.info(`Roles or rules not found, skipping seeder.`);
      return;
    }

    const { permissions: permissionsData, permission_rules } =
      generatePermissions(initPermissionConfig, roles, rules, type);

    await drizzle.insert(permissions).values(permissionsData).run();

    await drizzle.insert(permissionRules).values(permission_rules).run();

    logger.info("Role seeded successfully!");
  } catch (error) {
    logger.error("Error seeding default config:", error);
    throw error;
  }
}
