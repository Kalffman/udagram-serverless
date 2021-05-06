import * as GroupBusiness from "../../business/groupBusiness";
import * as express from "express";
import * as AWSExpress from 'aws-serverless-express'

const app = express();

app.get("/groups", async (_req, res) => {
    const groups = await GroupBusiness.getAllGroups();

    res.json({
        items: groups
    })
});

const server = AWSExpress.createServer(app);

export const main = (event, context) => {AWSExpress.proxy(server, event, context)};
