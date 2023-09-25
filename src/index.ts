import Bao from "baojs";
import webhookRoute from "./routes/webhook.route";
import { initDatabase } from "./database/sqlite.database";

initDatabase();
const app = new Bao();

webhookRoute(app);

const server = app.listen();

console.log(`Listening on ${server.hostname}:${server.port}`);
