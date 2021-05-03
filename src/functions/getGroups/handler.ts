import { APIGatewayProxyEvent, APIGatewayProxyHandler, APIGatewayProxyResult } from "aws-lambda";
import * as GroupBusiness from "../../business/groupBusiness";

const getGroups: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    console.log("Processando evento", event)

    const groups = await GroupBusiness.getAllGroups();

    return {
        statusCode: 200,
        headers: {
            "Access-Control-Allow-Origin": "*"
        },
        body: JSON.stringify({
            items: groups
        })
    }
}

export const main = getGroups;
