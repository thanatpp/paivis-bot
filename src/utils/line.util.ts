import { FlexComponent, FlexBubble, FlexMessage } from "@line/bot-sdk";

export const createBubble = (
  title: string,
  body: FlexComponent[],
  footer: FlexComponent,
  altText: string
): FlexMessage => {
  const bubble: FlexBubble = {
    type: "bubble",
    body: {
      type: "box",
      layout: "vertical",
      contents: [
        {
          type: "text",
          text: title,
          weight: "bold",
          color: "#1DB446",
          size: "lg",
        },
        {
          type: "separator",
          margin: "xxl",
        },
        ...body,
        {
          type: "separator",
          margin: "xxl",
        },
        footer,
      ],
    },
    styles: {
      footer: {
        separator: true,
      },
    },
  };

  return {
    type: "flex",
    altText,
    contents: bubble,
  };
};
