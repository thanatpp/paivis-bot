import Database, { SQLQueryBindings } from "bun:sqlite";
import { getAllExpense } from "../modules/expense.module";
import { logger } from "../utils/logger.util";

export async function initDatabase(): Promise<Database> {
  const db = Database.open(":memory:");
  db.run(`CREATE table transactions (
        id          INTEGER PRIMARY KEY AUTOINCREMENT,
        name        TEXT,
        category    TEXT NOT NULL,
        amount      REAL NOT NULL,
        date        TEXT NOT NULL,
        total       REAL NOT NULL
    )`);
  await syncExpenseTransactions(db);
  return db;
}
async function syncExpenseTransactions(db: Database) {
  console.time("Sync expense transaction");
  logger.info(`Start sync expense transaction`);

  const expenseDatas = await getAllExpense();
  const insert = db.prepare(
    `INSERT INTO transactions (id, name, category, amount, date, total) 
    VALUES ($id, $name, $category, $amount, $date, $total)`
  );

  const expensies: SQLQueryBindings[] = expenseDatas.map((ex) => {
    return {
      $id: ex.id,
      $name: ex.name,
      $category: ex.category,
      $amount: ex.amount,
      $date: ex.date,
      $total: ex.total,
    };
  });

  const insertExpensies = db.transaction((exs: SQLQueryBindings[]) => {
    exs.forEach((ex, i) => {
      insert.run(ex);
      logger.info(
        `Create expense transaction success ${i + 1} of ${exs.length}`
      );
    });
    logger.info(`Sync expense transaction complete ${exs.length} reccords`);
  });

  insertExpensies(expensies);
  console.timeEnd("Sync expense transaction");
}
