import { runBot } from "@core/bot";
import { jobCleanOldChatReplyEditTG, jobCleanOldParamTG } from "@core/cron";
import { runInitialSeeders } from "@core/db/utils";
import express, { Application } from "express";

const app: Application = express();

// seeders
await runInitialSeeders();
//

// tg bot
await runBot();
//

// cron jobs
jobCleanOldParamTG.start();
jobCleanOldChatReplyEditTG.start();
//

export default app;
