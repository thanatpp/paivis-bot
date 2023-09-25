import Bao from "baojs";
import webhookController from "../controllers/webhook.controller";
import { webhookMiddleware } from "../middlewares/webhook.middleware";
import { loggerInbound, loggerOutbound } from "../utils/logger.util";

export default function webhookRoute(app: Bao) {
  app.before(webhookMiddleware);
  app.before(loggerInbound);
  app.post("/webhook", webhookController);
  app.after(loggerOutbound);
}
