import * as uuid from "uuid";
import {Group} from "../models/Group";
import {GroupDataLayerAWS} from "../dataLayer/groupDataLayerAWS";
import {CreateGroupRequest} from "../requests/CreateGroupRequest";
import {getUserId} from "../auth/utils";

const groupData = new GroupDataLayerAWS();

export async function getAllGroups(): Promise<Group[]> {
    return groupData.getAllGroups()
}

export async function createGroup(request: CreateGroupRequest, jwtToken: string): Promise<Group> {
    const itemId = uuid.v4();
    const userId = getUserId(jwtToken);
    const timestamp = new Date().toISOString();

    return await groupData.createGroup({
        id: itemId,
        userId,
        name: request.name,
        description: request.description,
        timestamp
    });
}
