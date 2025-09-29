import type { chatTG, permissions, role, rules, typeTG } from "@core/db/models";
import type { Context as BaseContext } from "grammy";

export type Context = BaseContext & {
  chatDB: typeof chatTG.$inferSelect;
  role: typeof role.$inferSelect;
  configUser: typeof permissions.$inferSelect;
  rules: Record<string, typeof rules.$inferSelect>;
  chatType: typeof typeTG.$inferSelect;

  isMsg?: boolean;
  isCmd?: boolean;
  isCallback?: boolean;
  isKeyboard?: boolean;
};
