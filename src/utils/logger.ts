import { Context } from "baojs";
import pino from "pino";

export const logger = pino({
  messageKey: "message",
  formatters: {
    level: (label) => {
      function getSeverity(label: string) {
        switch (label) {
          case "trace":
            return "DEBUG";
          case "debug":
            return "DEBUG";
          case "info":
            return "INFO";
          case "warn":
            return "WARNING";
          case "error":
            return "ERROR";
          case "fatal":
            return "CRITICAL";
          default:
            return "DEFAULT";
        }
      }
      return { severity: getSeverity(label) };
    },
  },
}).child({ service: "paivis" });

export const loggerInbound = (ctx: Context) => {
  const path = ctx.path;
  const request: unknown = ctx.extra.req;

  logger.info({ type: "INBOUND", path, request });
  return ctx;
};

export const loggerOutbound = async (ctx: Context) => {
  const path = ctx.path;
  const response = await ctx.res?.text();
  const status = ctx.res?.status;

  logger.info({
    type: "OUTBOUND",
    path,
    status,
    response,
  });
  return ctx;
};
