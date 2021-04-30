import {
    CustomAuthorizerEvent,
    CustomAuthorizerResult
} from "aws-lambda";
import {verify } from "jsonwebtoken";
import {JwtToken } from "../../auth/jwtToken";
import * as middy from "middy";
import {secretsManager} from "middy/middlewares";

const secretId = process.env.AUTH_0_SECRET_ID;
const secretField = process.env.AUTH_0_SECRET_FIELD;

const customAuthorizer = middy(async (event: CustomAuthorizerEvent, context): Promise<CustomAuthorizerResult> => {
    try {
        const decodedToken = await verifyToken(event.authorizationToken, context.AUTH0_SECRET[secretField]);

        console.log("Usuário autorizado");

        return {
            principalId: decodedToken.sub,
            policyDocument: {
                Version: "2012-10-17",
                Statement: [
                    {
                        Action: "execute-api:Invoke",
                        Effect: "Allow",
                        Resource: "*"
                    }
                ]
            }
        }
    } catch (e) {
        console.log("Usuário não autorizado", e.message);

        return {
            principalId: "user",
            policyDocument: {
                Version: "2012-10-17",
                Statement: [
                    {
                        Action: "execute-api:Invoke",
                        Effect: "Deny",
                        Resource: "*"
                    }
                ]
            }
        }
    }
});

function verifyToken(authHeader: string, secret: string): JwtToken {
    if (!authHeader) {
        throw new Error("No authorization header");
    }
    if (!authHeader.toLocaleLowerCase().startsWith("bearer")) {
        throw new Error("Invalid authorization header");
    }

    const split = authHeader.split(" ");

    const token = split[1];

    return verify(token, secret) as JwtToken;
}

customAuthorizer.use(secretsManager({
    cache: true,
    cacheExpiryInMillis: 60000,
    throwOnFailedCall: true,
    secrets: {
        AUTH0_SECRET: secretId,

    }
}))

export const main = customAuthorizer;
