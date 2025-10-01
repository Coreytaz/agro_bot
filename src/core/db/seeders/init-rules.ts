import logger from "@core/utils/logger";

import { drizzle } from "../drizzle";
import { rules } from "../models";

const initialData: string[] = [
  ...new Set([
    "*",
    "/start",
    "/id",
    "/menu",
    "/reset",
    "card.rename",
    "process.start",
  ]),
];

export default async function seedDefaultConfig() {
  try {
    const existingConfigs = await drizzle.select().from(rules).all();

    if (existingConfigs.length > 0) {
      logger.info("Role already exists, skipping seeding.");
      return;
    }

    await drizzle
      .insert(rules)
      .values(
        initialData.map(config => ({
          route: config,
        })),
      )
      .run();

    logger.info("Role seeded successfully!");
  } catch (error) {
    logger.error("Error seeding default config:", error);
    throw error;
  }
}
