import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import {
  DynamoDBDocumentClient,
  ExecuteStatementCommand,
} from "@aws-sdk/lib-dynamodb";

import { v4 as uuidv4 } from "uuid";
const client = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(client);

const ITEM_PK = "ITEM";

//-------SAVE ITEM FUNCTION-----------
const saveItem = async (tableName, data) => {
  const SK = data?.label + "#" + uuidv4(); //format label#ID => manage default label sorting

  let result;
  try {
    const command = new ExecuteStatementCommand({
      Statement: `INSERT INTO ${tableName} value {'pk':?,'sk':?,'label':?,'category':?,'price':?}`,
      Parameters: [ITEM_PK, SK, data?.label, data?.category, data?.price],
      ConsistentRead: true,
    });

    result = await docClient.send(command);
  } catch (e) {
    console.error(JSON.stringify(e));
    return e;
  }

  return result;
};

//-------LIST ITEMs FUNCTION-----------
const getItemList = async (tableName, filterKey, filterValue) => {
  let params = [ITEM_PK];
  let statement = `SELECT id,sk,label,category,price FROM ${tableName} WHERE pk=? order by sk ASC`;

  if (filterKey) {
    statement = `SELECT id,sk,label,category,price FROM ${tableName} WHERE pk=? AND contains(${filterKey}, ?) order by sk ASC`;
    params = [...params, filterValue];
  }

  let command = new ExecuteStatementCommand({
    Statement: statement,
    Parameters: params,
    ConsistentRead: true,
  });

  let result;
  try {
    result = await docClient.send(command);
  } catch (error) {
    console.error(JSON.stringify(error));
    return error;
  }

  return result;
};

export { getItemList, saveItem };
