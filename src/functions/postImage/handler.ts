import { ValidatedEventAPIGatewayProxyEvent } from "@libs/apiGateway";
import { middyfy } from '@libs/lambda';
import { DynamoDB } from "aws-sdk";
import * as uuid from "uuid";
import schema from "./schema";

const docClient = new DynamoDB.DocumentClient();

const groupsTable = process.env.GROUPS_TABLE;
const imagesTable = process.env.IMAGES_TABLE;

const postImage: ValidatedEventAPIGatewayProxyEvent<typeof schema> = async (event) => {
    console.log("Processando evento", event)

    const groupId = event.pathParameters.groupId;
    const isValidGroupId = groupIdExists(groupId);

    if(!isValidGroupId) {
        return {
            statusCode: 404,
            headers: {
                "Access-Control-Allow-Origin": "*"
            },
            body: JSON.stringify({
                error: `Group id "${groupId}" not found.`
            })
        };
    }


    const newImageId = uuid.v4();

    const newImage = {
        id: newImageId,
        ...event.body
    }

    await docClient.put({
        TableName: imagesTable,
        Item: newImage
    }).promise();


    return {
        statusCode: 201,
        headers: {
            "Access-Control-Allow-Origin": "*"
        },
        body: JSON.stringify({
            newImage
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

export const main = middyfy(postImage);