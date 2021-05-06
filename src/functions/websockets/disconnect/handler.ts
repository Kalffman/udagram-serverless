import { APIGatewayProxyEvent, APIGatewayProxyHandler, APIGatewayProxyResult } from 'aws-lambda';
import 'source-map-support';
import * as AWS from 'aws-sdk';
import * as AWSXRay from "aws-xray-sdk";

const XAWS = AWSXRay.captureAWS(AWS);

const docClient = new XAWS.DynamoDB.DocumentClient();

const connectionsTabel = process.env.CONNECTIONS_TABLE;

const disconnection: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> =>{
    console.log("Processando evento", event);

    const connectionId = event.requestContext.connectionId;
    const key = {
        id: connectionId
    };

    await docClient.delete({
        TableName: connectionsTabel,
        Key: key
    }).promise();

    return {
        statusCode: 200,
        body: ''
    }
}

export const main = disconnection;
