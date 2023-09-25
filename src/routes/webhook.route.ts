import Bao from "baojs";
import webhookController from "../controllers/webhook.controller";
import { webhookMiddleware } from "../middlewares/webhook.middleware";
import { loggerInbound, loggerOutbound } from "../utils/logger.util";
import Database from "bun:sqlite";

export default function webhookRoute(app: Bao, db: Database) {
  app.before(webhookMiddleware);
  app.before(loggerInbound);
  app.post("/webhook", (ctx) => webhookController(ctx));
  app.after(loggerOutbound);
}
