import { clearSession, getActiveSession, upsertSession } from "@core/db/models";
import type { NextFunction } from "grammy";

import type { Context } from "../interface/Context";

export interface SessionContext {
  session?: {
    chatId: string;
    userId: string;
    route: string | null;
    data: Record<string, unknown> | null;
    isActive: number;
    expiresAt: string | null;
    created_at: string;
    updated_at: string;
  } | null;
  sessionSet?: (args: {
    route: string;
    data?: Record<string, unknown>;
    ttlSec?: number;
    active?: boolean;
  }) => Promise<void>;
  sessionClear?: () => Promise<void>;
}

const sessionContext = (ctx: Context): SessionContext => {
  const chatId = ctx.chatDB.chatId;
  const userId = String(ctx.from?.id ?? "");

  return {
    session: ctx.session,
    sessionSet: async ({ route, data = {}, ttlSec = 600, active = true }) => {
      const expiresAt = new Date(Date.now() + ttlSec * 1000).toISOString();
      await upsertSession({
        chatId,
        userId,
        route,
        data,
        isActive: active ? 1 : 0,
        expiresAt,
      });
      ctx.session = (await getActiveSession(chatId, userId)) as any;
    },
    sessionClear: async () => {
      await clearSession(chatId, userId);
      ctx.session = (await getActiveSession(chatId, userId)) as any;
    },
  };
};

export default async function session(ctx: Context, next: NextFunction) {
  const chatId = ctx.chatDB.chatId;
  const userId = String(ctx.from?.id ?? "");

  const current = await getActiveSession(chatId, userId);
  ctx.session = current
    ? { ...current, data: (current.data as Record<string, unknown> | null) }
    : null;

  const api = sessionContext(ctx);
  ctx.sessionSet = api.sessionSet;
  ctx.sessionClear = api.sessionClear;

  await next();
}
