import Bao from "baojs";
import { validateSignature } from "@line/bot-sdk";
import webhookController from "../controllers/webhook.controller";
import { WebhookRequestBody } from "@line/bot-sdk";

export default function webhookRoute(app: Bao) {
  app.before(async (ctx) => {
    const key = ctx.query.get("apiKey");
    if (process.env.API_KEY !== key) {
      return ctx.sendEmpty({ status: 401 }).forceSend();
    }

    const request: WebhookRequestBody = await ctx.req.json();
    const signature = ctx.headers.get("X-Line-Signature");
    if (
      signature === null ||
      !validateSignature(
        JSON.stringify(request),
        process.env.LINE_YOUR_CHANNEL_SECRET,
        signature
      )
    ) {
      return ctx.sendEmpty({ status: 403 }).forceSend();
    }

    ctx.extra["req"] = request;
    return ctx;
  });

  app.post("/webhook", webhookController);
}
