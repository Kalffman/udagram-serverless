import { ValidatedEventAPIGatewayProxyEvent } from "@libs/apiGateway";
import { middyfy } from '@libs/lambda';
import * as AWS from "aws-sdk";
import * as AWSXRay from "aws-xray-sdk";
import * as uuid from "uuid";
import schema from "./schema";

const XAWS = AWSXRay.captureAWS(AWS);

const docClient = new XAWS.DynamoDB.DocumentClient();

const s3 = new XAWS.S3({
    signatureVersion: "v4"
})

const groupsTable = process.env.GROUPS_TABLE;
const imagesTable = process.env.IMAGES_TABLE;
const bucketName = process.env.IMAGES_S3_BUCKET;
const urlExpiration = parseInt(process.env.SIGNED_URL_EXPIRATION);

const postImage: ValidatedEventAPIGatewayProxyEvent<typeof schema> = async (event) => {
    console.log("Processando evento", event)

    const groupId = event.pathParameters.groupId;
    const isValidGroupId = groupIdExists(groupId);

    if(!isValidGroupId) {
        return {
            statusCode: 404,
            headers: {
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Credentials": "*"
            },
            body: JSON.stringify({
                error: `Group id "${groupId}" not found.`
            })
        };
    }


    const imageId = uuid.v4();
    const timestamp = new Date().toISOString();

    const newImage = {
        groupId,
        timestamp,
        imageId,
        ...event.body,
        imageUrl: `https://${bucketName}.s3.amazonaws.com/${imageId}`
    }

    await docClient.put({
        TableName: imagesTable,
        Item: newImage
    }).promise();


    const url = getUploadUrl(imageId);

    return {
        statusCode: 201,
        headers: {
            "Access-Control-Allow-Origin": "*"
        },
        body: JSON.stringify({
            newItem: newImage,
            uploadUrl: url
        })
    }
}

function getUploadUrl(imageId: string) {
    return s3.getSignedUrl("putObject", {
        Bucket: bucketName,
        Key: imageId,
        Expires: urlExpiration
    });
}

async function groupIdExists(groupId: string) {
    const result = await docClient.get({
        TableName: groupsTable,
        Key: { id: groupId }
    }).promise();

    return !!result.Item;
}

export const main = middyfy(postImage);
