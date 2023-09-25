import { logger } from "../utils/logger.util";
import { ExpenseReccord } from "../models/expense.model";
import { Client, LogLevel } from "@notionhq/client";
import { PageObjectResponse } from "@notionhq/client/build/src/api-endpoints";
import { pageObjectResponseToObject } from "../utils/notion.util";
import Database from "bun:sqlite";

const notion = new Client({
  auth: process.env.NOTION_TOKEN,
  logLevel: LogLevel.INFO,
});

const expenseDatabaseId = process.env.NOTION_EXPENSE_DATABASE_ID ?? "";

export const categorys: {
  [key: string]: string;
} = {
  t: "transportation",
  f: "food",
  d: "drinks",
  h: "health",
  m: "misc",
  n: "note",
};

export async function createExpense(
  payload: ExpenseReccord
): Promise<ExpenseReccord> {
  try {
    const response = await notion.pages.create({
      parent: {
        type: "database_id",
        database_id: expenseDatabaseId,
      },
      properties: {
        Name: {
          type: "title",
          title: [
            {
              type: "text",
              text: {
                content: payload.Name,
              },
            },
          ],
        },
        Category: {
          type: "rich_text",
          rich_text: [
            {
              type: "text",
              text: {
                content: payload.Category,
              },
            },
          ],
        },
        Amount: {
          type: "number",
          number: payload.Amount,
        },
        Total: {
          type: "number",
          number: payload.Total,
        },
        Date: {
          type: "date",
          date: {
            start: payload.Date,
          },
        },
      },
    });
    const result = response as PageObjectResponse;
    return pageObjectResponseToObject<ExpenseReccord>(result);
  } catch (err) {
    logger.error("Failed to create expense record");
    throw err;
  }
}

export async function getExpenseByDate(
  dateTime: Date
): Promise<ExpenseReccord[]> {
  try {
    const response = await notion.databases.query({
      database_id: expenseDatabaseId,
      filter: {
        property: "Date",
        date: {
          on_or_after: dateTime.toISOString(),
        },
      },
    });
    const results = response.results as PageObjectResponse[];
    return results.map((r) => pageObjectResponseToObject<ExpenseReccord>(r));
  } catch (err) {
    logger.error("Failed to get expense by date");
    throw err;
  }
}

export async function getExpenseFirstReccord(): Promise<ExpenseReccord | null> {
  try {
    const response = await notion.databases.query({
      database_id: expenseDatabaseId,
      sorts: [{ property: "Date", direction: "ascending" }],
      page_size: 1,
    });

    if (response.results.length === 0) {
      return null;
    }

    const result = response.results as PageObjectResponse[];
    return pageObjectResponseToObject<ExpenseReccord>(result[0]);
  } catch (err) {
    logger.error("Failed to get expense first reccord");
    throw err;
  }
}

export async function getFirstDateExpense(
  db: Database
): Promise<string | null> {
  const firstDateFromCacheDB = getCacheDB(db, "first_date");
  if (firstDateFromCacheDB) {
    return firstDateFromCacheDB;
  }

  const reccord = await getExpenseFirstReccord();
  const date = reccord ? reccord.Date : new Date().toISOString();

  saveCacheDB(db, "first_date", date);
  return date;
}

export async function getLastTotalExpense(
  db: Database
): Promise<number | null> {
  const firstDateFromCacheDB = getCacheDB(db, "total");
  if (firstDateFromCacheDB) {
    return Number(firstDateFromCacheDB);
  }

  const reccord = await getExpenseLastReccord();
  const total = reccord ? reccord.Total : 0;

  saveCacheDB(db, "total", total.toString());
  return total;
}

export async function getExpenseLastReccord(): Promise<ExpenseReccord | null> {
  try {
    const response = await notion.databases.query({
      database_id: expenseDatabaseId,
      sorts: [{ property: "Date", direction: "descending" }],
      page_size: 1,
    });

    if (response.results.length === 0) {
      return null;
    }

    const result = response.results as PageObjectResponse[];
    return pageObjectResponseToObject<ExpenseReccord>(result[0]);
  } catch (err) {
    logger.error("Failed to get expense last reccord");
    throw err;
  }
}

export function getCacheDB(db: Database, key: string): string | null {
  try {
    const query = db.query("SELECT value FROM cache WHERE key=?1");
    const total = <{ value: string } | null>query.get(key);
    return total ? total.value : total;
  } catch (err) {
    logger.error("Failed to get total from cache db");
    throw err;
  }
}

export function saveCacheDB(db: Database, key: string, value: string): void {
  try {
    const insert = db.prepare(
      `INSERT INTO cache VALUES (?1, ?2) ON CONFLICT do UPDATE SET value=?2`
    );
    insert.run(key, value);
  } catch (err) {
    logger.error("Failed to save total to cache db");
    throw err;
  }
}
