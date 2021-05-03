import { ValidatedEventAPIGatewayProxyEvent } from "@libs/apiGateway";
import { middyfy } from '@libs/lambda';
import schema from "./schema";

import * as GroupBusiness from "../../business/groupBusiness";
import {CreateGroupRequest} from "../../requests/CreateGroupRequest";

const postGroup: ValidatedEventAPIGatewayProxyEvent<typeof schema> = async (event) => {
    console.log("Processando evento", event)

    const newGroup: CreateGroupRequest = event.body;

    await GroupBusiness.createGroup(newGroup, event.headers.Authorization.split(" ")[1]);

    return {
        statusCode: 201,
        headers: {
            "Access-Control-Allow-Origin": "*"
        },
        body: JSON.stringify({
            newGroup
        })
    }
}

export const main = middyfy(postGroup);
