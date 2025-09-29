import logger from "@core/utils/logger";

import { initialDataTypeTG } from "../config";
import { drizzle } from "../drizzle";
import { typeTG } from "../models";

export default async function seedDefaultConfig() {
  try {
    const existingConfigs = await drizzle.select().from(typeTG).all();

    if (existingConfigs.length > 0) {
      logger.info("typeTG already exists, skipping seeding.");
      return;
    }

    for (const config of Object.values(initialDataTypeTG)) {
      await drizzle.insert(typeTG).values(config).run();
    }

    logger.info("typeTG seeded successfully!");
  } catch (error) {
    logger.error("Error seeding default config:", error);
    throw error;
  }
}
