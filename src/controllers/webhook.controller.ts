import { Context } from "baojs";
import { Client, WebhookRequestBody, WebhookEvent } from "@line/bot-sdk";
import { config } from "../config/line.config";

export default function webhookController(ctx: Context) {
  const req = ctx.extra.req as WebhookRequestBody;
  const client = new Client(config());
  replyMessage(client, req.events);
  return ctx.sendText("success");
}

function replyMessage(client: Client, events: WebhookEvent[]) {
  events.forEach(async (e: WebhookEvent) => {
    if (e.type === "message" && e.message.type === "text")
      await client.replyMessage(e.replyToken, {
        type: "text",
        text: e.message.text,
      });
  });
}
