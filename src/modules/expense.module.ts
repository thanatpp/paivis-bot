import Airtable from "airtable";
import { logger } from "../utils/logger.util";
import { ExpenseReccord } from "../models/expense.model";

const tableName = "expense-tracker";

const expenseTable = () => {
  return new Airtable({ apiKey: process.env.AIRTABLE_API_KEY })
    .base(process.env.AIRTABLE_EXPENSE_BASE)
    .table(tableName);
};

export async function createExpense(
  name: string,
  category: string,
  amount: string,
  date: Date
) {
  try {
    const payload: ExpenseReccord = {
      Name: name.trim(),
      Category: category,
      Amount: Number(amount),
      Date: date.toISOString(),
    };

    logger.info(
      { payload: JSON.stringify(payload) },
      "Start create expense record"
    );
    const recorded = await expenseTable().create(
      { ...payload },
      { typecast: true }
    );

    logger.info(`End create expense recorded id: ${recorded.id} success`);
    return recorded;
  } catch (err) {
    logger.error("Failed to create expense record");
    throw err;
  }
}

export async function getExpenseByDate(date: Date): Promise<ExpenseReccord[]> {
  try {
    date.setHours(0, 0, 0, 0);
    const filter =
      'OR(IS_SAME({Date}, "' +
      date.toString() +
      '"),  IS_AFTER({Date}, "' +
      date.toString() +
      '"))';
    logger.info("Start get expense by condition: " + filter);
    const result = await expenseTable()
      .select({
        filterByFormula: filter,
        sort: [{ field: "Date" }],
      })
      .all();
    const reccords = result.map((r): ExpenseReccord => {
      return toToObject(r.fields);
    });
    logger.info(
      "End get expense by condition success reccords length: " + reccords.length
    );
    return reccords;
  } catch (err) {
    logger.error("Failed to get expense by date");
    throw err;
  }
}

export async function getExpenseFirstReccord(): Promise<ExpenseReccord | null> {
  try {
    logger.info("Start get expense first reccord");
    const result = await expenseTable()
      .select({
        maxRecords: 1,
        sort: [{ field: "Date" }],
      })
      .firstPage();
    logger.info("Start get expense first reccord length: " + result.length);

    if (result.length === 0) {
      return null;
    }

    return toToObject(result[0].fields);
  } catch (err) {
    logger.error("Failed to get expense by date");
    throw err;
  }
}

const toToObject = (field: Record<string, unknown>): ExpenseReccord => {
  return {
    Name: field["Name"]?.toString() ?? "",
    Category: field["Category"]?.toString() ?? "",
    Amount: Number(field["Amount"]) ?? 0,
    Date: field["Date"]?.toString() ?? "",
  };
};
