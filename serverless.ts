import type { AWS } from "@serverless/typescript";

import getGroups from "@functions/getGroups";
import postGroup from "@functions/postGroup";

const serverlessConfiguration: AWS = {
  service: "serverless-udagram-app",
  frameworkVersion: "2",
  custom: {
    webpack: {
      webpackConfig: "./webpack.config.js",
      includeModules: true,
    },
  },
  plugins: ["serverless-webpack"],
  provider: {
    name: "aws",
    runtime: "nodejs12.x",
    environment: {
      GROUPS_TABLE: "Groups-${self:provider.stage}"
    },
    iam: {
      role: {
        statements: [
          {
            Effect: "Allow",
            Action: [
              "dynamodb:Scan",
              "dynamodb:PutItem"
            ],
            Resource: "arn:aws:dynamodb:${self:provider.region}:*:table/${self:provider.environment.GROUPS_TABLE}"
          }
        ]
      }
    },
    lambdaHashingVersion: "20201221",
    stage: "${opt:stage, 'dev'}",
    region: "sa-east-1"
  },
  functions: { getGroups, postGroup },
  resources: {
    Resources: {
      GroupsDynamoDBTable: {
        Type: "AWS::DynamoDB::Table",
        Properties: {
          AttributeDefinitions: [
            {
              AttributeName: "id",
              AttributeType: "S"
            }
          ],
          KeySchema: [
            {
              AttributeName: "id",
              KeyType: "HASH"
            }
          ],
          BillingMode: "PAY_PER_REQUEST",
          TableName: "${self:provider.environment.GROUPS_TABLE}"
        }
      }
    }
  }
};

module.exports = serverlessConfiguration;
