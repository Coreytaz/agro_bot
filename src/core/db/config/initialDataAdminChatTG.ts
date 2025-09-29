import type { chatAdminsTG, chatTG } from "../models";
import { initialDataRoles } from "./initialDataRoles";
import { initialDataTypeTG } from "./initialDataTypeTG";

export const chatIdDataChatTG = {
  gamy1337: "1221893505",
};

export const chatIdDataChatTGArray = Object.values(chatIdDataChatTG);

export const initialDataAdminChatTG: Record<
  (typeof chatTG.$inferInsert)["name"],
  Required<Omit<typeof chatTG.$inferInsert, "created_at" | "updated_at">>
> = {
  gamy1337: {
    id: 1,
    chatId: chatIdDataChatTG.gamy1337,
    roleId: initialDataRoles.admin.id,
    name: "gamy1337",
    typeId: initialDataTypeTG.private.id,
  },
};

export const initialDataAdminsChatTG: Record<
  NonNullable<(typeof chatAdminsTG.$inferInsert)["name"]>,
  Required<
    Omit<typeof chatAdminsTG.$inferInsert, "id" | "created_at" | "updated_at">
  >
> = {
  gamy1337: {
    chatId: initialDataAdminChatTG.gamy1337.id,
    name: "gamy1337",
    adminChatId: chatIdDataChatTG.gamy1337,
    isActive: 1,
  },
};

