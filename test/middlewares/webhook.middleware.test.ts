const line = require("@line/bot-sdk");
import { test, spyOn, describe, expect } from "bun:test";
import { webhookMiddleware } from "../../src/middlewares/webhook.middleware";
import { HEADER_LINE_SIGNATURE, QUERY_API_KEY } from "../../src/utils/constant";
import { Context } from "baojs";
import { Server } from "bun";

describe("Webhook middleware test", () => {
  test("validate success test", async () => {
    const context = mockContext();
    spyOn(line, "validateSignature").mockReturnValue(true);
    const actual = await webhookMiddleware(context);
    expect(actual).not.toBeNull();
  });

  test("when invalid api key", async () => {
    const context = mockContext("mock-api-key");
    const actual = await webhookMiddleware(context);
    expect(actual.res?.status).toBe(401);
  });

  test("when request is not from line", async () => {
    const context = mockContext();
    spyOn(line, "validateSignature").mockReturnValue(false);
    const actual = await webhookMiddleware(context);
    expect(actual.res?.status).toBe(403);
  });
});

const mockContext = (apiKey?: string): Context => {
  const request = new Request("https://example.com/");
  const server = {} as Server;
  const context = new Context(request, server);
  context.query.set(QUERY_API_KEY, apiKey ?? process.env.API_KEY);
  context.headers.set(HEADER_LINE_SIGNATURE, "HEADER_LINE_SIGNATURE");
  return {
    ...context,
    req: {
      json: () => {},
    },
  } as Context;
};
