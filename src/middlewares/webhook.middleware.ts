import line from "@line/bot-sdk";
import { Context } from "baojs";
import { HEADER_LINE_SIGNATURE, QUERY_API_KEY } from "../utils/constant.util";

export async function webhookMiddleware(ctx: Context) {
  const key = ctx.query.get(QUERY_API_KEY);
  if (process.env.API_KEY !== key) {
    return ctx.sendEmpty({ status: 401 }).forceSend();
  }
  ctx.query.delete(QUERY_API_KEY);

  const req = await ctx.req.json();
  const signature = ctx.headers.get(HEADER_LINE_SIGNATURE);
  if (
    signature === null ||
    !isRequestFromLine(JSON.stringify(req), signature)
  ) {
    return ctx.sendEmpty({ status: 403 }).forceSend();
  }

  ctx.extra["req"] = req;
  return ctx;
}

function isRequestFromLine(body: string, signature: string): boolean {
  return line.validateSignature(
    body,
    process.env.LINE_CHANNEL_SECRET,
    signature
  );
}
