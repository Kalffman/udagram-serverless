import type { AWS } from "@serverless/typescript";

import getGroups from "@functions/getGroups";
import postGroup from "@functions/postGroup";
import getImagesByGroup from "@functions/getImagesByGroup";
import getImageById from "@functions/getImageById";
import postImage from "@functions/postImage";
import imagesUploadEvent from "@functions/imagesUploadEvent";
import connect from "@functions/websockets/connect";
import disconnect from "@functions/websockets/disconnect";

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
      IMAGE_ID_INDEX: "ImageIdIndex",
      CONNECTIONS_TABLE: "Connections-${self:provider.stage}",
      IMAGES_S3_BUCKET: "kalffman-serverless-udagram-images-${self:provider.stage}",
      SIGNED_URL_EXPIRATION: "300"
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
          },

          {
            Effect: "Allow",
            Action: [
              "s3:PutObject",
              "s3:GetObject"
            ],
            Resource: "arn:aws:s3:::${self:provider.environment.IMAGES_S3_BUCKET}/*"
          },
          {
            Effect: "Allow",
            Action: [
              "dynamodb:Scan",
              "dynamodb:PutItem",
              "dynamodb:DeleteItem"
            ],
            Resource: "arn:aws:dynamodb:${self:provider.region}:*:${self:provider.environment.CONNECTIONS_TABLE}"
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
    postImage,
    imagesUploadEvent,
    connect,
    disconnect
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

      ConnectionsTable: {
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
          TableName: "${self:provider.environment.CONNECTIONS_TABLE}"
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
          GlobalSecondaryIndexes: [
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
      },

      AttachmentsBucket: {
        Type: "AWS::S3::Bucket",
        Properties: {
          BucketName: "${self:provider.environment.IMAGES_S3_BUCKET}",
          CorsConfiguration: {
            CorsRules: [
              {
                AllowedOrigins: ["*"],
                AllowedHeaders: ["*"],
                AllowedMethods: ["GET", "PUT", "POST", "DELETE", "HEAD"],
                MaxAge: 3000
              }
            ]
          }
        }
      },

      BucketPolicy: {
        Type: "AWS::S3::BucketPolicy",
        Properties: {
          Bucket: {
            Ref: "AttachmentsBucket"
          },
          PolicyDocument: {
            Version: "2012-10-17",
            Statement: [
              {
                Sid: "PublicReadForGetBucketObjects",
                Principal: "*",
                Effect: "Allow",
                Action: ["s3:GetObject"],
                Resource: "arn:aws:s3:::${self:provider.environment.IMAGES_S3_BUCKET}/*"
              }
            ],
          }
        }
      }
    }
  }
};

module.exports = serverlessConfiguration;
