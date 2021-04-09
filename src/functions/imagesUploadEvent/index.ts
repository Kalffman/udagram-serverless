import { handlerPath } from "@libs/handlerResolver";

export default {
    handler: `${handlerPath(__dirname)}/handler.main`,
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