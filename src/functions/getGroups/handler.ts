
import { DynamoDB } from "aws-sdk";

import { APIGatewayProxyEvent, APIGatewayProxyHandler, APIGatewayProxyResult } from "aws-lambda";

const docClient = new DynamoDB.DocumentClient();

const groupsTable = process.env.GROUPS_TABLE;

const getGroups: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    console.log("Processando evento", event)

    const result = await docClient.scan({
        TableName: groupsTable
    }).promise();

    const items = result.Items;

    return {
        statusCode: 200,
        headers: {
            "Access-Control-Allow-Origin": "*"
        },
        body: JSON.stringify({
            items
        })
    }
}

export const main = getGroups;