import { Context } from "baojs";
import { Client, WebhookRequestBody } from "@line/bot-sdk";
import { config } from "../configs/line.config";
<<<<<<< HEAD
import webhookService from "../services/webhook.service";

export default async function webhookController(ctx: Context) {
  try {
    const req = ctx.extra.req as WebhookRequestBody;
    const client = new Client(config());
    await webhookService(req, client);
    return ctx.sendEmpty({ status: 200 });
  } catch (err) {
    console.log(err);
    return ctx.sendEmpty({ status: 500 });
  }
=======

export default function webhookController(ctx: Context) {
  const req = ctx.extra.req as WebhookRequestBody;
  const client = new Client(config());
  return ctx.sendEmpty({ status: 200 });
>>>>>>> 6c4b02294a09bb1b634e9545e16455d586356f3f
}
