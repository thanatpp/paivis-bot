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
  getExpenseFirstReccord,
  getExpenseLastReccord,
} from "../modules/expense.module";
import { createBubble } from "../utils/line.util";

export default async function webhookService(
  req: WebhookRequestBody,
  client: Client
) {
  const events = req.events;
  for (const event of events) {
    if (event.type === "message") {
      await handleEventMessage(event.message, event.replyToken, client);
    }
  }
}

async function handleEventMessage(
  event: EventMessage,
  replyToken: string,
  client: Client
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

      const lastReccord = await getExpenseLastReccord();
      let total = lastReccord?.total ?? 0;
      if (ctg !== "note") {
        total += amount;
      }

      const reccorded = await createExpense({
        name,
        category: ctg,
        amount: Number(amount),
        date: date.toISOString(),
        total,
        id: 0,
      });

      const summaryExpense = await summaryTodyExpense(date, total);
      await client.replyMessage(
        replyToken,
        createExpenseBubble(
          reccorded.name,
          reccorded.category,
          reccorded.amount,
          summaryExpense
        )
      );
    }
  }
}

async function summaryTodyExpense(date: Date, totalUsed: number) {
  const newDate = date;
  newDate.setHours(0, 0, 0, 0);

  const reccords = await getExpenseByDate(newDate);
  const firstReccord = await getExpenseFirstReccord();
  const lastReccordIndex = reccords.length - 1;
  const lastReccord = reccords[lastReccordIndex];
  const usedToday = reccords
    .filter((r) => r.category !== "note")
    .map((r) => r.amount)
    .reduce((a, b) => a + b, 0);

  if (!firstReccord) {
    return [usedToday, +process.env.DAILY_PACE - totalUsed, 1];
  }

  const firstDate = new Date(firstReccord.date);
  firstDate.setHours(0, 0, 0, 0);
  const lastDate = new Date(lastReccord.date);
  lastDate.setHours(0, 0, 0, 0);
  const diffDays =
    Number((lastDate.valueOf() - firstDate.valueOf()) / (1000 * 60 * 60 * 24)) +
    1;
  const pace = +process.env.DAILY_PACE * diffDays - totalUsed;
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
