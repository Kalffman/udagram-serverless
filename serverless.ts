import type { AWS } from "@serverless/typescript";

import getGroups from "@functions/getGroups";
import postGroup from "@functions/postGroup";
import getImagesByGroup from "@functions/getImagesByGroup";
import getImageById from "@functions/getImageById";
import postImage from "@functions/postImage";
import imagesUploadEvent from "@functions/imagesUploadEvent";
import connect from "@functions/websockets/connect";
import disconnect from "@functions/websockets/disconnect";
import dynamoStreamHandler from "@functions/dynamoDB";
import resizeToThumbnails from "@functions/resizeToThumbnails";
import auth from "@functions/auth";

const serverlessConfiguration: AWS = {
  service: "serverless-udagram-app",
  frameworkVersion: "2",
  custom: {
    topicName: "imagesTopic-${self:provider.stage}",
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
      THUMBNAILS_S3_BUCKET: "kalffman-serverless-udagram-thumbnails-${self:provider.stage}",
      SIGNED_URL_EXPIRATION: "300",
      AUTH_0_SECRET_ID: "AuthSecret-${self:provider.stage}",
      AUTH_0_SECRET_FIELD: "auth0Secret"
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
            ],
            Resource: "arn:aws:s3:::${self:provider.environment.THUMBNAILS_S3_BUCKET}/*"
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
            Resource: "arn:aws:dynamodb:${self:provider.region}:*:table/${self:provider.environment.CONNECTIONS_TABLE}"
          },
          {
            Effect: "Allow",
            Action: [
              "secretsmanager:GetSecretValue"
            ],
            Resource: {Ref: "Auth0Secret"}
          },
          {
            Effect: "Allow",
            Action: [
              "kms:Decrypt"
            ],
            Resource: { "Fn::GetAtt": ["KMSKey", "Arn"] }
          }
        ]
      }
    },
    lambdaHashingVersion: "20201221",
    stage: "${opt:stage, 'dev'}",
    // @ts-ignore
    region: "${opt:region, 'sa-east-1'}"
  },
  functions: {
    getGroups,
    postGroup,
    getImagesByGroup,
    getImageById,
    postImage,
    imagesUploadEvent,
    connect,
    disconnect,
    dynamoStreamHandler,
    resizeToThumbnails,
    auth
  },
  resources: {
    Resources: {

      GatewayResponseDefault4XX: {
        Type: "AWS::ApiGateway::GatewayResponse",
        Properties: {
          ResponseParameters: {
            "gatewayresponse.header.Access-Control-Allow-Origin": "'*'",
            "gatewayresponse.header.Access-Control-Allow-Headers": "'Content-Type,X-Amz-Date,Authorization'",
            "gatewayresponse.header.Access-Control-Allow-Methods": "'GET,OPTIONS,POST'",
          },
          ResponseType: "DEFAULT_4XX",
          RestApiId: { Ref: "ApiGatewayRestApi" }
        }
      },

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
          StreamSpecification:{
            StreamViewType: "NEW_IMAGE"
          },
          TableName: "${self:provider.environment.IMAGES_TABLE}"
        }
      },

      ThumbnailsBucket: {
        Type: "AWS::S3::Bucket",
        Properties: {
          BucketName: "${self:provider.environment.THUMBNAILS_S3_BUCKET}",
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

      AttachmentsBucket: {
        Type: "AWS::S3::Bucket",
        DependsOn: [ "ImagesTopic" ],
        Properties: {
          BucketName: "${self:provider.environment.IMAGES_S3_BUCKET}",
          NotificationConfiguration: {
            TopicConfigurations: [
              {
                Event: "s3:ObjectCreated:Put",
                Topic: { Ref: "ImagesTopic" }
              }
            ],
          },
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
      },

      ImagesSearch: {
        Type: "AWS::Elasticsearch::Domain",
        Properties: {
          ElasticsearchVersion: "6.3",
          DomainName: "images-search-${self:provider.stage}",
          ElasticsearchClusterConfig: {
            DedicatedMasterEnabled: false,
            InstanceCount: "1",
            ZoneAwarenessEnabled: false,
            InstanceType: "t2.small.elasticsearch",
          },
          EBSOptions: {
            EBSEnabled: true,
            Iops: 0,
            VolumeSize: 10,
            VolumeType: "gp2"
          },
          AccessPolicies: {
            Version: "2012-10-17",
            Statement: [
              {
                Principal: { AWS: "*" },
                Effect: "Allow",
                Action: [
                  "es:ESHttp"
                ],
                Resource: {
                  "Fn::Sub": "arn:aws:es:${self:provider.region}:${AWS::AccountId}:domain/images-search-${self:provider.stage}/*"
                }
              }
            ]
          }
        }
      },

      ImagesTopic: {
        Type: "AWS::SNS::Topic",
        Properties: {
          DisplayName: "Images Bucket Topic",
          TopicName: "${self:custom.topicName}"
        }
      },

      SNSTopicPolicy: {
        Type: "AWS::SNS::TopicPolicy",
        Properties: {
          PolicyDocument: {
            Version: "2012-10-17",
            Statement: [
              {
                Effect: "Allow",
                Principal: { AWS: "*" },
                Action: "sns:Publish",
                Resource: {Ref: "ImagesTopic"},
                Condition: {
                  ArnLike: {
                    "AWS:SourceArn": "arn:aws:s3:::${self:provider.environment.IMAGES_S3_BUCKET}"
                  }
                }
              }
            ]
          },
          Topics: [
            { Ref: "ImagesTopic" }
          ]
        }
      },

      KMSKey: {
        Type: "AWS::KMS::Key",
        Properties: {
          Description: "KMS key to encrypt Auth0 secret",
          KeyPolicy: {
            Version: "2012-10-17",
            Id: "key-default-1",
            Statement: [
              {
                Sid: "Allow administration of the key",
                Effect: "Allow",
                Principal: {
                  AWS: {
                    "Fn::Join":[
                      ":",
                      [
                        "arn:aws:iam:",
                        { Ref: "AWS::AccountId" },
                        "root"
                      ]
                    ]
                  }
                },
                Action: [ "kms:*" ],
                Resource: "*"
              }
            ]
          }
        }
      },

      KMSKeyAlias: {
        Type: "AWS::KMS::Alias",
        Properties: {
          AliasName: "alias/auth0key-${self:provider.stage}",
          TargetKeyId: {Ref: "KMSKey"}
        }
      },

      Auth0Secret: {
        Type: "AWS::SecretsManager::Secret",
          Properties: {
            Name: "${self:provider.environment.AUTH_0_SECRET_ID}",
            Description: "Auth0 secret",
            KmsKeyId: {Ref: "KMSKey"}
          }
      }
    }
  }
};

module.exports = serverlessConfiguration;
