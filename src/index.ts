import Bao from "baojs";
import webhookRoute from "./routes/webhook.route";
import { initDatabase } from "./database/sqlite.database";

const db = await initDatabase();
const app = new Bao();

webhookRoute(app, db);

const server = app.listen();

console.log(`Listening on ${server.hostname}:${server.port}`);
