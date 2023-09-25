import {
  Client,
  EventMessage,
  FlexComponent,
  WebhookRequestBody,
} from "@line/bot-sdk";
import {
  categorys,
  createExpense,
  getExpenseByDate,
  getFirstDateExpense,
  getLastTotalExpense,
  saveCacheDB,
} from "../modules/expense.module";
import { createBubble } from "../utils/line.util";
import Database from "bun:sqlite";

const dailyPace = process.env.DAILY_PACE ? +process.env.DAILY_PACE : 0;

export default async function webhookService(
  req: WebhookRequestBody,
  client: Client,
  db: Database
) {
  const events = req.events;
  for (const event of events) {
    console.time("handle event message process time");
    if (event.type === "message") {
      await handleEventMessage(event.message, event.replyToken, client, db);
    }
    console.timeEnd("handle event message process time");
  }
}

async function handleEventMessage(
  event: EventMessage,
  replyToken: string,
  client: Client,
  db: Database
) {
  if (event.type === "text") {
    const text = event.text.trim();
    const regex = /^([\d.]+|[ivxlcdm]+)([tfdhmn])([ \wก-๙0-9!@#$%^&*]+|)$/i;
    const match = text.match(regex);

    if (match) {
      const ctgKey = match[2].toString().toLowerCase();
      const ctg = categorys[ctgKey];
      const amount = Number(match[1]);
      const name = match[3] ?? "";
      const date = new Date();

      const total = await getTotal(db, amount, ctg);
      saveCacheDB(db, "total", total.toString());

      const reccorded = await createExpense({
        Name: name,
        Category: ctg,
        Amount: amount,
        Date: date.toISOString(),
        Total: total,
      });

      const summaryExpense = await summaryTodyExpense(db, date, total);
      await client.replyMessage(
        replyToken,
        createExpenseBubble(
          reccorded.Name,
          reccorded.Category,
          reccorded.Amount,
          summaryExpense
        )
      );
    }
  }
  console.timeEnd("handleEventMessage");
}

async function getTotal(db: Database, amount: number, category: string) {
  let lastTotoal = (await getLastTotalExpense(db)) ?? 0;
  const total = category !== "note" ? lastTotoal + amount : lastTotoal;
  return total;
}

async function summaryTodyExpense(db: Database, date: Date, totalUsed: number) {
  const newDate = date;
  newDate.setHours(0, 0, 0, 0);

  const reccords = await getExpenseByDate(newDate);
  const firstDateReccord = await getFirstDateExpense(db);
  const lastReccordIndex = reccords.length - 1;
  const lastReccord = reccords[lastReccordIndex];
  const usedToday = reccords
    .filter((r) => r.Category !== "note")
    .map((r) => r.Amount)
    .reduce((a, b) => a + b, 0);

  if (!firstDateReccord) {
    return [usedToday, dailyPace - totalUsed, 1];
  }

  const firstDate = new Date(firstDateReccord);
  firstDate.setHours(0, 0, 0, 0);
  const lastDate = new Date(lastReccord.Date);
  lastDate.setHours(0, 0, 0, 0);
  const diffDays =
    Number((lastDate.valueOf() - firstDate.valueOf()) / (1000 * 60 * 60 * 24)) +
    1;
  const pace = dailyPace * diffDays - totalUsed;
  return [usedToday, pace, diffDays];
}

const createExpenseBubble = (
  name: string,
  category: string,
  amount: number,
  summary: number[]
) => {
  const detail = [category, name]
    .filter((s) => s.trim().length !== 0)
    .join(", ");
  const altText = `Expense tracking ฿${amount.toFixed(2)} ${detail}`;
  const body: FlexComponent[] = [
    {
      type: "text",
      text: "฿ " + amount.toFixed(2),
      weight: "bold",
      size: "xl",
      margin: "md",
    },
    {
      type: "text",
      text: detail,
      size: "md",
      color: "#aaaaaa",
      wrap: true,
    },
    {
      type: "text",
      text: "reccorded",
      size: "md",
      color: "#aaaaaa",
      wrap: true,
    },
  ];

  const contentFooter = ["today", "pace", "day"].map(
    (key, index): FlexComponent => {
      return {
        type: "box",
        layout: "vertical",
        contents: [
          {
            type: "text",
            color: "#8b8685",
            text: key,
            size: "sm",
          },
          {
            type: "text",
            text:
              key === "day"
                ? summary[index].toFixed(0)
                : "฿" + summary[index].toFixed(2),
            color: "#8b8685",
            size: "sm",
          },
        ],
        alignItems: "flex-start",
      };
    }
  );

  const footer: FlexComponent = {
    type: "box",
    layout: "horizontal",
    contents: contentFooter,
    margin: "xs",
  };

  return createBubble("Expense tracking", body, footer, altText);
};
