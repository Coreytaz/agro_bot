import { runBot } from "@core/bot";
import { runInitialSeeders } from "@core/db/utils";
import express, { Application } from "express";

const app: Application = express();

// seeders
await runInitialSeeders();
//

// tg bot
await runBot();
//

export default app;
