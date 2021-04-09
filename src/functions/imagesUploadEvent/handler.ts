import { S3Handler, S3Event } from 'aws-lambda';
import 'source-map-support/register';

const imageCreated: S3Handler = async (event: S3Event) => {
    for( const record of event.Records) {
        const key = record.s3.object.key;
        console.log("Processando Objeto no S3", key);
    }
}

export const main = imageCreated;