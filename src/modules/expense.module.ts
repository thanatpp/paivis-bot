import { logger } from "../utils/logger.util";
import { ExpenseReccord } from "../models/expense.model";
import { Client, LogLevel } from "@notionhq/client";
import { PageObjectResponse } from "@notionhq/client/build/src/api-endpoints";

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
  c: "clothes",
  g: "game",
  h: "health",
  m: "miscellaneous",
  s: "shopping",
  e: "entertainment",
  b: "bill",
  r: "residence",
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
        Date: {
          type: "date",
          date: {
            start: payload.Date,
          },
        },
      },
    });
    const result = response as PageObjectResponse;
    return notionPropertiesToObject<ExpenseReccord>(result);
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
        property: "Date",
        date: {
          on_or_after: dateTime.toISOString(),
        },
      },
    });
    const results = response.results as PageObjectResponse[];
    return results.map((r) => notionPropertiesToObject<ExpenseReccord>(r));
  } catch (err) {
    logger.error("Failed to get expense by date");
    throw err;
  }
}

export async function getExpenseFirstReccord(): Promise<ExpenseReccord | null> {
  try {
    const response = await notion.databases.query({
      database_id: process.env.NOTION_EXPENSE_DATABASE_ID,
      sorts: [{ property: "Date", direction: "descending" }],
      page_size: 1,
    });

    if (response.results.length === 0) {
      return null;
    }

    const result = response.results as PageObjectResponse[];
    return notionPropertiesToObject<ExpenseReccord>(result[0]);
  } catch (err) {
    logger.error("Failed to get expense by date");
    throw err;
  }
}

function notionPropertiesToObject<Type>(por: PageObjectResponse): Type {
  let result = {} as Type;
  for (const [key, value] of Object.entries(por.properties)) {
    switch (value.type) {
      case "title":
        result = { ...result, [key]: value.title[0].plain_text };
        break;
      case "rich_text":
        result = { ...result, [key]: value.rich_text[0].plain_text };
        break;
      case "date":
        result = { ...result, [key]: value.date?.start ?? "" };
        break;
      case "number":
        result = { ...result, [key]: value.number };
        break;
      default:
        return { ...result, [key]: "" };
    }
  }
  return result;
}
