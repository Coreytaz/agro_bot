import { SQLWrapper } from "drizzle-orm";
import { int, sqliteTable, text } from "drizzle-orm/sqlite-core";

import type { drizzle } from "../drizzle";
import type { DrizzleTx } from "../types";
import { getAll, getOne, timestamps } from "../utils";

export const RoleType = {
  admin: "admin",
  user: "user",
  guest: "guest",
  moderator: "moderator",
} as const;

export type RoleType = (typeof RoleType)[keyof typeof RoleType];

export const role = sqliteTable("role", {
  id: int().primaryKey({ autoIncrement: true }),
  name: text("name", {
    enum: Object.values(RoleType) as [string, ...string[]],
  })
    .$type<RoleType>()
    .notNull()
    .unique(),
  ...timestamps,
});

export const getOneRole = async (
  args: Partial<typeof role.$inferSelect>,
  options: { ctx?: typeof drizzle | DrizzleTx } = {},
) => {
  const { ctx } = options;
  return getOne(role, { ctx })(args);
};

export const getAllRoles = async (
  args: Partial<typeof role.$inferSelect>,
  ...where: (SQLWrapper | undefined)[]
) => {
  return getAll(role)(args, ...where);
};
