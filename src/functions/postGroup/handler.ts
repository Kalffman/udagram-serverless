
import { DynamoDB } from "aws-sdk";
import * as uuid from "uuid";

import { APIGatewayProxyEvent, APIGatewayProxyHandler, APIGatewayProxyResult } from "aws-lambda";

const docClient = new DynamoDB.DocumentClient();

const groupsTable = process.env.GROUPS_TABLE;

const postGroup: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    console.log("Processando evento", event)

    const newItemId = uuid.v4();

    console.log("event.body", event.body);

    const parsedBody = JSON.parse(event.body);

    const newItem = {
        id: newItemId,
        ...parsedBody
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

export const main = postGroup;