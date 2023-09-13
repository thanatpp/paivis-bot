import { Context } from "baojs";

export default function webhookService(ctx: Context) {
  return ctx.sendText("send from webhook service");
}
