import type { chatAdminsTG, chatTG } from "../models";
import { initialDataRoles } from "./initialDataRoles";
import { initialDataTypeTG } from "./initialDataTypeTG";

export const chatIdDataChatTG = {
  gamy1337: "1221893505",
  na_weka: "411789166",
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
  na_weka: {
    id: 2,
    chatId: chatIdDataChatTG.na_weka,
    roleId: initialDataRoles.admin.id,
    name: "na_weka",
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
  na_weka: {
    chatId: initialDataAdminChatTG.na_weka.id,
    name: "na_weka",
    adminChatId: chatIdDataChatTG.na_weka,
    isActive: 1,
  },
};

