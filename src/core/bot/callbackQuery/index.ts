import type { NextFunction } from "grammy";

import type { Context } from "../core/interface/Context";
import about from "./about";
import adminBack from "./admin-back";
import adminContent from "./admin-content";
import adminUsers from "./admin-users";
import broadcast from "./broadcast";
import broadcastSchedule from "./broadcast-schedule";
import help from "./help";
import language from "./language";
import menu from "./menu";
import processStart from "./process.start";
import settings from "./settings";

const callbackHandlers: Record<
  string,
  (ctx: Context, next: NextFunction) => Promise<void>
> = {
  "process.start": processStart,
  about: about,
  help: help,
  menu: menu,
  settings: settings,
  ...language,
  ...adminBack,
  ...adminContent,
  ...adminUsers,
  ...broadcast,
  ...broadcastSchedule,
};

export default callbackHandlers;
