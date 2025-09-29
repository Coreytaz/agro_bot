import logger from "@core/utils/logger";

import { initialDataRoles } from "../config";
import { drizzle } from "../drizzle";
import { role } from "../models";



export default async function seedDefaultConfig() {
  try {
    const existingConfigs = await drizzle.select().from(role).all();

    if (existingConfigs.length > 0) {
      logger.info("Role already exists, skipping seeding.");
      return;
    }

    // Вставляем начальные данные
    for (const config of Object.values(initialDataRoles)) {
      await drizzle.insert(role).values(config).run();
    }

    logger.info("Role seeded successfully!");
  } catch (error) {
    logger.error("Error seeding default config:", error);
    throw error;
  }
}
