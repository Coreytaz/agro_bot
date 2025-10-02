import type {
  chatTG,
  permissions,
  role,
  rules,
  sessionTG,
  typeTG,
} from "@core/db/models";
import type { CommandsFlavor } from "@grammyjs/commands";
import type { Context as BaseContext } from "grammy";

import type { ParamsExtractorDB } from "../utils";
import type { ContextWithEditAndReply } from "./ContextWithEditAndReply";
import { Localization } from "./LocalizationContext";

export type Context = BaseContext &
  CommandsFlavor &
  ContextWithEditAndReply &
  Localization & {
    chatDB: typeof chatTG.$inferSelect;
    role: typeof role.$inferSelect;
    configUser: typeof permissions.$inferSelect;
    rules: Record<string, typeof rules.$inferSelect>;
    chatType: typeof typeTG.$inferSelect;

    paramsExtractor?: ParamsExtractorDB;

    usernameBot?: string;
    referralLink?: string;

    isMsg?: boolean;
    isCmd?: boolean;
    isCallback?: boolean;
    isKeyboard?: boolean;

    // Session (awaiting input) support
    session?:
      | (Omit<typeof sessionTG.$inferSelect, "data"> & {
          data: Record<string, unknown> | null;
        })
      | null;
    sessionSet?: (args: {
      route: string;
      data?: Record<string, unknown>;
      ttlSec?: number;
      active?: boolean;
    }) => Promise<void>;
    sessionClear?: () => Promise<void>;
  };
