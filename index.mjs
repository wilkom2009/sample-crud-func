import { getItemList, saveItem } from "./item-service.mjs";

export const handler = async (event) => {
  const TABLE_NAME = process.env.TABLE;
  const routeKey = event.routeKey;

  let statusCode = 200;
  let data = [];

  switch (routeKey) {
    case "POST /api/items":
      {
        //Call save Item
        await saveItem(TABLE_NAME, JSON.parse(event.body))
          .then((res) => {
            if (res.$metadata.httpStatusCode === 400) {
              statusCode = 400;
            } else {
              data = res;
            }
          })
          .catch((e) => {
            console.log(JSON.stringify(e.errorMessage));
            statusCode = 500;
          });
      }
      break;

    case "GET /api/items":
      {
        const filterKey = event.queryStringParameters?.filterKey
          ? event.queryStringParameters?.filterKey
          : null;
        const filterValue = event.queryStringParameters?.filterValue
          ? event.queryStringParameters?.filterValue
          : null;
        // Call Get Item list
        await getItemList(TABLE_NAME, filterKey, filterValue)
          .then((res) => {
            data = res;
          })
          .catch((e) => {
            console.log(JSON.stringify(e.errorMessage));
            statusCode = 500;
          });
      }
      break;

    default:
      break;
  }

  const response = {
    statusCode,
    body: JSON.stringify(data),
  };
  return response;
};
