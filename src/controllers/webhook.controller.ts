import { Context } from "baojs";
import { Client, WebhookRequestBody } from "@line/bot-sdk";
import { config } from "../configs/line.config";
import { newDatabase } from "../database/sqlite.database";

import webhookService from "../services/webhook.service";

export default async function webhookController(ctx: Context) {
  try {
    const req = ctx.extra.req as WebhookRequestBody;
    const client = new Client(config());
    const db = newDatabase();

    await webhookService(req, client, db);
    return ctx.sendEmpty({ status: 200 });
  } catch (err) {
    console.log(err);
    return ctx.sendEmpty({ status: 500 });
  }
}
