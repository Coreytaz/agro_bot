import logger from "@core/utils/logger";
import { NextFunction } from "grammy";

import { Context } from "../interface/Context";
import { loggerTG } from "../utils";

export default async function message(ctx: Context, next: NextFunction) {
  try {
    logger.debug(`isMsg = ${ctx.isMsg}`);

    await next();
    return;
  } catch (error) {
    logger.info(error instanceof Error ? error.message : String(error));
    void loggerTG.error(error instanceof Error ? error.message : String(error));
  }
}
