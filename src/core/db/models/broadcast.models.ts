import type { SQLWrapper } from "drizzle-orm";
import { int, sqliteTable, text } from "drizzle-orm/sqlite-core";

import {
  BroadcastStatus,
  IBroadcast,
  ICreateBroadcast,
  IUpdateBroadcast,
} from "../interface";
import { DrizzleOptions } from "../types";
import { createOne, getAll, getOne, timestamps, updateOne } from "../utils";

export const broadcast = sqliteTable("broadcast", {
  id: int().primaryKey({ autoIncrement: true }),
  title: text().notNull(),
  message: text().notNull(),
  imageUrl: text(),
  status: text().notNull().default("draft"),
  totalUsers: int().default(0),
  sentCount: int().default(0),
  errorCount: int().default(0),
  createdBy: text().notNull(),
  cronExpression: text(),
  isScheduled: int({ mode: "boolean" }).default(false),
  isRecurring: int({ mode: "boolean" }).default(false),
  ...timestamps,
});

export const createOneBroadcast = async <T extends typeof broadcast>(
  args: Omit<T["$inferInsert"], "id" | "created_at" | "updated_at">,
) => {
  return createOne(broadcast)(args);
};

export const getOneBroadcast = async <T extends typeof broadcast>(
  args: Partial<T["$inferSelect"]>,
  options: DrizzleOptions = {},
  ...where: (SQLWrapper | undefined)[]
) => {
  return getOne(broadcast, options)(args, ...where);
};

export const updateOneBroadcast = async <T extends typeof broadcast>(
  args: Partial<T["$inferSelect"]>,
  where?: Partial<T["$inferSelect"]>,
  ...rest: (SQLWrapper | undefined)[]
) => {
  return updateOne(broadcast)(args, where, ...rest);
};

export const getAllBroadcast = async <T extends typeof broadcast>(
  args?: Partial<T["$inferSelect"]>,
  options: DrizzleOptions = {},
  ...rest: (SQLWrapper | undefined)[]
) => {
  return getAll(broadcast, options)(args, ...rest);
};

export const createBroadcast = async (data: ICreateBroadcast) => {
  return await createOneBroadcast(data);
};

export const getBroadcastById = async (
  id: number,
): Promise<IBroadcast | null> => {
  const result = await getOneBroadcast({ id });
  return result as IBroadcast | null;
};

export const getAllBroadcasts = async () => {
  return await getAllBroadcast();
};

export const getBroadcastsByStatus = async (
  status: BroadcastStatus,
): Promise<IBroadcast[]> => {
  return (await getAllBroadcast({ status })) as IBroadcast[];
};

export const updateBroadcast = async (
  id: number,
  data: IUpdateBroadcast,
): Promise<IBroadcast | null> => {
  return (await updateOneBroadcast(data, { id })) as IBroadcast | null;
};

export const updateBroadcastStatus = async (
  id: number,
  status: BroadcastStatus,
): Promise<IBroadcast | null> => {
  return (await updateOneBroadcast({ status }, { id })) as IBroadcast | null;
};

export const updateBroadcastProgress = async (
  id: number,
  sentCount: number,
  errorCount: number,
  totalUsers?: number,
): Promise<IBroadcast | null> => {
  const updateData: IUpdateBroadcast = {
    sentCount,
    errorCount,
  };

  if (totalUsers !== undefined) {
    updateData.totalUsers = totalUsers;
  }

  return (await updateOneBroadcast(updateData, { id })) as IBroadcast | null;
};

export const completeBroadcast = async (
  id: number,
): Promise<IBroadcast | null> => {
  return (await updateOneBroadcast(
    {
      status: "sent",
    },
    { id },
  )) as IBroadcast | null;
};
