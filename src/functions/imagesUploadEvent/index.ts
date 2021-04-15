import { handlerPath } from "@libs/handlerResolver";

export default {
    handler: `${handlerPath(__dirname)}/handler.main`,
    environment: {
        STAGE: "${self:provider.stage}",
        API_ID: { Ref: "WebsocketsApi" },
        REGION: "${self:provider.region}"
    },
    events: [
        {
            s3: {
                bucket: "kalffman-serverless-udagram-images-dev",
                event: "s3:ObjectCreated:*",
                existing: true
            }
        }
    ]
}