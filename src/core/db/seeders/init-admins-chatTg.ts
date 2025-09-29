import logger from "@core/utils/logger";

import { initialDataAdminsChatTG } from "../config";
import { drizzle } from "../drizzle";
import { chatAdminsTG } from "../models";

export default async function seedDefaultConfig() {
  try {
    const existingConfigs = await drizzle.select().from(chatAdminsTG).all();

    if (existingConfigs.length > 0) {
      logger.info("chatAdminsTG admin already exists, skipping seeding.");
      return;
    }

    await drizzle
      .insert(chatAdminsTG)
      .values(Object.values(initialDataAdminsChatTG))
      .run();

    logger.info("chatAdminsTG admin seeded successfully!");
  } catch (error) {
    logger.error("Error seeding default config:", error);
    throw error;
  }
}
