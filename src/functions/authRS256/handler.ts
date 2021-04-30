import {
    CustomAuthorizerEvent,
    CustomAuthorizerResult
} from "aws-lambda";
import { verify } from "jsonwebtoken";
import {JwtToken} from "../../auth/jwtToken";

const cert = `-----BEGIN CERTIFICATE-----
MIIDBTCCAe2gAwIBAgIJUr8guoPl3KvBMA0GCSqGSIb3DQEBCwUAMCAxHjAcBgNV
BAMTFWthbGZmbWFuLnVzLmF1dGgwLmNvbTAeFw0yMTA0MjIxMDAzNDhaFw0zNDEy
MzAxMDAzNDhaMCAxHjAcBgNVBAMTFWthbGZmbWFuLnVzLmF1dGgwLmNvbTCCASIw
DQYJKoZIhvcNAQEBBQADggEPADCCAQoCggEBALkFNqODtnbKe5yStZ/3P3fCw6BN
avgyi1LmYvHkkjxH6Ld0GVsfm1R5wHPpJXtKo+UEpptSpElzLIYD7IIHuZhGrTLL
0JPyiPWO0fx8P/rAr8UwbDnvjXkMFS5GE/lu10BbD1wDyoUk5/X2eGwhAZmnGa5f
S8XHpxP7xnGQ70oAKz3j9W0zwqmRNLsJ70TR2xjdP1bTXi7ksT3XGqnnC/56R/ua
i2MvM8CnMwJSZM8aDq1Gul/XG3SsTRTuV8n+qPTNk9pSvT8TV6jdbNnlNTaZbwm6
WeOoNCxTthq/kMa7bseib4khbLbRwSFwdxvFpl4XD8HDUW2vXwmE+e6iWI0CAwEA
AaNCMEAwDwYDVR0TAQH/BAUwAwEB/zAdBgNVHQ4EFgQUdg091POjBKuD16tSWu9D
WZkCMZ8wDgYDVR0PAQH/BAQDAgKEMA0GCSqGSIb3DQEBCwUAA4IBAQBLSXk/lf05
ZJAIg+ziicEdZid8N1R7JfjQ0NwtNF/mNTJjH9Jl58+XpTBN7AC9lwmsn3q2P+v3
ro7SrWWsWhAxIVswfkIsphAGb7sp8zyCO0Is2VclAmnD8TW9k6l6+7w0Kzx3CQYF
7Ia/iERgs4DA/w3P4PUBqoy4SxSwiR1dIVeuQCvk6YvCmx+s6MEdSmg6h9YC5ypF
s3Pe3LRT1U7KoAlEpZTE0eMDfkYMzeh90yFqJKCZRJaRK6k9kYmDvxWA6jPs9YsX
6KqqH5KZgzeXmd7TN+3p4dhaLo3lgw4/og1PYaicEWj9lMVmeBtXnkognzk5WH0D
oFmxbQRV1Row
-----END CERTIFICATE-----`

const rs256Authorizer = async (event: CustomAuthorizerEvent): Promise<CustomAuthorizerResult> => {
    try {
        const decodedToken = await verifyToken(event.authorizationToken);

        console.log("Usuário autenticado");

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
        console.log("Usuário não autorizado", JSON.stringify(e));

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
}

function verifyToken(authHeader: string): JwtToken {
    if (!authHeader) {
        throw new Error("No authorization header");
    }

    if (!authHeader.toLocaleLowerCase().startsWith("bearer")) {
        throw new Error("Invalid authorization header");
    }

    const split = authHeader.split(" ");

    const token = split[1];

    return verify(token, cert, {algorithms: ["RS256"]}) as JwtToken;
}

export const main = rs256Authorizer;
