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
    const regex =
      /^([\d.]+|[ivxlcdm]+)([tfdcghmsebr])([ \wก-๙0-9!@#$%^&*]+|)$/i;
    const match = text.match(regex);

    if (match) {
      const ctgKey = match[2].toString().toLowerCase();
      const ctg = categorys[ctgKey];
      const amount = Number(match[1]);
      const name = match[3] ?? "";
      const date = new Date();

      const reccorded = await createExpense({
        Name: name,
        Category: ctg,
        Amount: Number(amount),
        Date: date.toISOString(),
      });

      const summaryExpense = await summaryTodyExpense(date);
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
}

async function summaryTodyExpense(date: Date) {
  const newDate = date;
  newDate.setHours(0, 0, 0, 0);

  const reccords = await getExpenseByDate(newDate);
  const firstReccord = await getExpenseFirstReccord();

  const lastReccordIndex = reccords.length - 1;
  const lastReccord = reccords[lastReccordIndex];

  const total = reccords.map((r) => r.Amount).reduce((a, b) => a + b);
  const pace = 300 - total;

  if (!firstReccord) {
    return [total, pace, 1];
  }

  const firstDate = new Date(firstReccord.Date).setHours(0, 0, 0, 0);
  const lastDate = new Date(lastReccord.Date).setHours(0, 0, 0, 0);
  const diffDays =
    Number((lastDate.valueOf() - firstDate.valueOf()) / (1000 * 60 * 60 * 24)) +
    1;
  return [total, pace, diffDays];
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
