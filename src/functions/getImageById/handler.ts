import { DynamoDB } from "aws-sdk";
import { APIGatewayProxyEvent, APIGatewayProxyHandler, APIGatewayProxyResult } from "aws-lambda";

const docClient = new DynamoDB.DocumentClient();

const imagesTable = process.env.IMAGES_TABLE;
const imageIdIndex = process.env.IMAGE_ID_INDEX;

const getImageById: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    console.log("Processando evento", event);

    const imageId = event.pathParameters.imageId;

    const result = await docClient.query({
        TableName: imagesTable,
        IndexName: imageIdIndex,
        KeyConditionExpression: "imageId = :imageId",
        ExpressionAttributeValues: { ":imageId": imageId }
    }).promise();

    if (result.Count !== 0) {
        return {
            statusCode: 200,
            headers: {
                "Access-Control-Allow-Origin": "*"
            },
            body: JSON.stringify(result.Items[0])
        }
    }

    return {
        statusCode: 404,
        headers: {
            "Access-Control-Allow-Origin": "*"
        },
        body: ''
    }
}

export const main = getImageById;