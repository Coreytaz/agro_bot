import logger from "@core/utils/logger";
import { inArray } from "drizzle-orm";

import { chatIdDataChatTGArray, initialDataAdminChatTG } from "../config";
import { drizzle } from "../drizzle";
import { chatTG } from "../models";

export default async function seedDefaultConfig() {
  try {
    const existingConfigs = await drizzle
      .select()
      .from(chatTG)
      .where(inArray(chatTG.chatId, chatIdDataChatTGArray))
      .all();

    if (existingConfigs.length > 0) {
      logger.info("ChatTg admin already exists, skipping seeding.");
      return;
    }

    await drizzle
      .insert(chatTG)
      .values(Object.values(initialDataAdminChatTG))
      .run();

    logger.info("ChatTg admin seeded successfully!");
  } catch (error) {
    logger.error("Error seeding default config:", error);
    throw error;
  }
}
