import logger from "@core/utils/logger";
import { NextFunction } from "grammy";

import awaits from "../../awaits";
import { Context } from "../interface/Context";
import { loggerTG } from "../utils";

export default async function message(ctx: Context, next: NextFunction) {
  try {
    logger.debug(`isMsg = ${ctx.isMsg}`);

    // If session is active and has a route, delegate to await handler
    const route = ctx.session && ctx.session.isActive ? ctx.session.route : undefined;
    if (route && Boolean(awaits[route])) {
      const handler = awaits[route];
      await handler(ctx, next);
      return;
    }

    await next();
    return;
  } catch (error) {
    logger.info(error instanceof Error ? error.message : String(error));
    void loggerTG.error(error instanceof Error ? error.message : String(error));
  }
}
