import { Context } from "baojs";
import { Client, WebhookRequestBody } from "@line/bot-sdk";
import { config } from "../configs/line.config";

export default function webhookController(ctx: Context) {
  const req = ctx.extra.req as WebhookRequestBody;
  const client = new Client(config());
  return ctx.sendEmpty({ status: 200 });
}
