import { PageObjectResponse } from "@notionhq/client/build/src/api-endpoints";

export function pageObjectResponseToObject<Type>(
  por: PageObjectResponse
): Type {
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
<<<<<<< HEAD
=======
      case "unique_id":
        result = { ...result, [key]: value.unique_id.number };
        break;
>>>>>>> 8e58848de0b31cb9c906e2f52ad4073b8cc273ad
      case "number":
        result = { ...result, [key]: value.number };
        break;
      default:
        return { ...result, [key]: "" };
    }
  }
  return result;
}
