import type { AWS } from "@serverless/typescript";

import getGroups from "@functions/getGroups";
import postGroup from "@functions/postGroup";
import getImagesByGroup from "@functions/getImagesByGroup";
import getImageById from "@functions/getImageById";
import postImage from "@functions/postImage";

const serverlessConfiguration: AWS = {
  service: "serverless-udagram-app",
  frameworkVersion: "2",
  custom: {
    documentation: {
      api: {
        info: {
          version: "v1.0.0",
          title: "Udagram API",
          description: "Aplicação Serverless"
        }
      }
    },
    webpack: {
      webpackConfig: "./webpack.config.js",
      includeModules: true,
    },
  },
  plugins: ["serverless-webpack"],
  provider: {
    name: "aws",
    profile: "serverless",
    runtime: "nodejs12.x",
    environment: {
      GROUPS_TABLE: "Groups-${self:provider.stage}",
      IMAGES_TABLE: "Images-${self:provider.stage}",
      IMAGE_ID_INDEX: "ImageIdIndex"
    },
    iam: {
      role: {
        statements: [
          {
            Effect: "Allow",
            Action: [
              "dynamodb:Scan",
              "dynamodb:PutItem",
              "dynamodb:GetItem"
            ],
            Resource: "arn:aws:dynamodb:${self:provider.region}:*:table/${self:provider.environment.GROUPS_TABLE}"
          },
          {
            Effect: "Allow",
            Action: [
              "dynamodb:PutItem",
              "dynamodb:Query"
            ],
            Resource: "arn:aws:dynamodb:${self:provider.region}:*:table/${self:provider.environment.IMAGES_TABLE}"
          },
          {
            Effect: "Allow",
            Action: [
              "dynamodb:Query"
            ],
            Resource: "arn:aws:dynamodb:${self:provider.region}:*:table/${self:provider.environment.IMAGES_TABLE}/index/${self:provider.environment.IMAGE_ID_INDEX}"
          }
        ]
      }
    },
    lambdaHashingVersion: "20201221",
    stage: "${opt:stage, 'dev'}",
    region: "sa-east-1"
  },
  functions: {
    getGroups, 
    postGroup,
    getImagesByGroup, 
    getImageById,
    postImage
  },
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
      },

      ImagesDynamoDBTable: {
        Type: "AWS::DynamoDB::Table",
        Properties: {
          AttributeDefinitions: [
            {
              AttributeName: "groupId",
              AttributeType: "S"
            },
            {
              AttributeName: "timestamp",
              AttributeType: "S"
            },
            {
              AttributeName: "imageId",
              AttributeType: "S"
            },
          ],
          KeySchema: [
            {
              AttributeName: "groupId",
              KeyType: "HASH"
            },
            {
              AttributeName: "timestamp",
              KeyType: "RANGE"
            }
          ],
          GlobalSecondaryIndexes:[
            {
              IndexName: "${self:provider.environment.IMAGE_ID_INDEX}",
              KeySchema: [
                {
                  AttributeName: "imageId",
                  KeyType: "HASH"
                }
              ],
              Projection: { ProjectionType: "ALL" }
            }
          ],
          BillingMode: "PAY_PER_REQUEST",
          TableName: "${self:provider.environment.IMAGES_TABLE}"
        }
      }

    }
  }
};

module.exports = serverlessConfiguration;
