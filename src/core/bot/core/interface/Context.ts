import type { chatTG, permissions, role, rules, typeTG } from "@core/db/models";
import type { CommandsFlavor } from "@grammyjs/commands";
import type { Context as BaseContext } from "grammy";

import type { ParamsExtractorDB } from "../utils";
import type { ContextWithEditAndReply } from "./ContextWithEditAndReply";

export type Context = BaseContext &
  CommandsFlavor &
  ContextWithEditAndReply & {
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
  };
