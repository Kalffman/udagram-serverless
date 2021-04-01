export default {
    title: "group",
    type: "object",
    properties: {
        groupId: {
            type: "string"
        },
        timestamp: {
            type: "string"
        },
        title: {
            type: "string"
        }
    },
    required: [
        "groupId",
        "timestamp",
        "title"
    ],
    additionalProperties: false
} as const;