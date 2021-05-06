
import * as AWS from "aws-sdk";
import * as AWSXRay from "aws-xray-sdk";

import { APIGatewayProxyEvent, APIGatewayProxyHandler, APIGatewayProxyResult } from "aws-lambda";

const XAWS = AWSXRay.captureAWS(AWS);

const docClient = new XAWS.DynamoDB.DocumentClient();

const groupsTable = process.env.GROUPS_TABLE;
const imagesTable = process.env.IMAGES_TABLE;

const getImagesByGroup: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    console.log("Processando evento", event)

    const groupId = event.pathParameters.groupId;

    const validGroupId = await groupIdExists(groupId);

    if(!validGroupId) {
        return {
            statusCode: 404,
            headers: {
                "Access-Control-Allow-Origin": "*"
            },
            body: JSON.stringify({
                error: `The group with id "${groupId}" does not exists.`
            })
        }
    }

    const images = await getImagesByGroupId(groupId);

    return {
        statusCode: 200,
        headers: {
            "Access-Control-Allow-Origin": "*"
        },
        body: JSON.stringify({
            items: images
        })
    }
}

async function groupIdExists(groupId: string) {
    const result = await docClient.get({
        TableName: groupsTable,
        Key: { id: groupId }
    }).promise();

    return !!result.Item;
}

async function getImagesByGroupId(groupId: string) {
    const result = await docClient.query({
        TableName: imagesTable,
        KeyConditionExpression: "groupId = :groupId",
        ExpressionAttributeValues: {
            ":groupId": groupId
        },
        ScanIndexForward: false
    }).promise();

    return result.Items
}
export const main = getImagesByGroup;
