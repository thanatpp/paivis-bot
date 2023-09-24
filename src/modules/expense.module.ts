import { logger } from "../utils/logger.util";
import { ExpenseReccord } from "../models/expense.model";
import { Client, LogLevel } from "@notionhq/client";
import { PageObjectResponse } from "@notionhq/client/build/src/api-endpoints";
import { pageObjectResponseToObject } from "../utils/notion.util";

const notion = new Client({
  auth: process.env.NOTION_TOKEN,
  logLevel: LogLevel.INFO,
});

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
        database_id: process.env.NOTION_EXPENSE_DATABASE_ID,
      },
      properties: {
        name: {
          type: "title",
          title: [
            {
              type: "text",
              text: {
                content: payload.name,
              },
            },
          ],
        },
        category: {
          type: "rich_text",
          rich_text: [
            {
              type: "text",
              text: {
                content: payload.category,
              },
            },
          ],
        },
        amount: {
          type: "number",
          number: payload.amount,
        },
        total: {
          type: "number",
          number: payload.total,
        },
        date: {
          type: "date",
          date: {
            start: payload.date,
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
      database_id: process.env.NOTION_EXPENSE_DATABASE_ID,
      filter: {
        property: "date",
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

export async function getAllExpense(): Promise<ExpenseReccord[]> {
  try {
    let hasMore = true;
    const results: PageObjectResponse[] = [];
    while (hasMore) {
      const response = await notion.databases.query({
        database_id: process.env.NOTION_EXPENSE_DATABASE_ID,
        sorts: [{ property: "date", direction: "ascending" }],
      });
      results.push(...(response.results as PageObjectResponse[]));
      hasMore = response.has_more;
    }
    return results.map((r) => pageObjectResponseToObject<ExpenseReccord>(r));
  } catch (err) {
    logger.error("Failed to get expense by date");
    throw err;
  }
}

export async function getExpenseFirstReccord(): Promise<ExpenseReccord | null> {
  try {
    const response = await notion.databases.query({
      database_id: process.env.NOTION_EXPENSE_DATABASE_ID,
      sorts: [{ property: "date", direction: "ascending" }],
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

export async function getExpenseLastReccord(): Promise<ExpenseReccord | null> {
  try {
    const response = await notion.databases.query({
      database_id: process.env.NOTION_EXPENSE_DATABASE_ID,
      sorts: [{ property: "date", direction: "descending" }],
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
