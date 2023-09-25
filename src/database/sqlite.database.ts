import Database from "bun:sqlite";
import {
  getFirstDateExpense,
  getLastTotalExpense,
} from "../modules/expense.module";

let db: Database;

export async function initDatabase() {
  db = Database.open(":memory:");
  db.run("CREATE table cache (key TEXT PRIMARY KEY, value TEXT)");
  await getFirstDateExpense(db);
  await getLastTotalExpense(db);
}

export function newDatabase(): Database {
  return db;
}
