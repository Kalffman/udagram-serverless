import { APIGatewayProxyEvent, APIGatewayProxyHandler, APIGatewayProxyResult } from 'aws-lambda';
import 'source-map-support';
import * as AWS from 'aws-sdk';


const docClient = new AWS.DynamoDB.DocumentClient();

const connectionsTabel = process.env.CONNECTIONS_TABLE;

const connection: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> =>{
    console.log("Processando evento", event);

    const connectionId = event.requestContext.connectionId;
    const timestamp = new Date().toISOString();


    const item = {
        id: connectionId,
        timestamp
    };

    await docClient.put({
        TableName: connectionsTabel,
        Item: item
    }).promise();

    return {
        statusCode: 200,
        body: ''
    }
}

export const main = connection;