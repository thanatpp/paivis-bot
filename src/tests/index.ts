import Bao from "baojs";

const app = new Bao();

app.get("/", (ctx) => {
  return ctx.sendText("Hello World!");
});

const server = app.listen();

console.log(`Listening on ${server.hostname}:${server.port}`);
