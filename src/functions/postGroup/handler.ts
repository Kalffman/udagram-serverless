import { ValidatedEventAPIGatewayProxyEvent } from "@libs/apiGateway";
import { middyfy } from '@libs/lambda';
import { DynamoDB } from "aws-sdk";
import * as uuid from "uuid";
import schema from "./schema";

const docClient = new DynamoDB.DocumentClient();

const groupsTable = process.env.GROUPS_TABLE;

const postGroup: ValidatedEventAPIGatewayProxyEvent<typeof schema> = async (event) => {
    console.log("Processando evento", event)

    const newItemId = uuid.v4();

    const newItem = {
        id: newItemId,
        ...event.body
    }

    await docClient.put({
        TableName: groupsTable,
        Item: newItem
    }).promise();


    return {
        statusCode: 201,
        headers: {
            "Access-Control-Allow-Origin": "*"
        },
        body: JSON.stringify({
            newItem
        })
    }
}

export const main = middyfy(postGroup);