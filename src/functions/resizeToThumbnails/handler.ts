import {S3EventRecord, SNSEvent, SNSHandler} from "aws-lambda";
import * as AWS from "aws-sdk";
import * as Jimp from "jimp";

const s3 = new AWS.S3();

const imagesBucketName = process.env.IMAGES_S3_BUCKET;
const thumbnailBucketName = process.env.THUMBNAILS_S3_BUCKET;

const resizeToThumbnail: SNSHandler = async (event: SNSEvent) => {
    console.log("Processando Evento SNS", JSON.stringify(event));

    for (const snsRecord of event.Records) {
        const s3EventStr = snsRecord.Sns.Message;

        console.log("Processando Evento S3", s3EventStr);

        const s3Event = JSON.parse(s3EventStr);

        for (const record of s3Event.Records) {
            await processImage(record);
        }
    }
}

async function processImage(record: S3EventRecord) {
    const key = record.s3.object.key;

    const response = await s3.getObject({
        Bucket: imagesBucketName,
        Key: key
    }).promise();

    // @ts-ignore
    const body: Buffer = Buffer.from(response.Body);

    const image = await Jimp.read(body);

    image.resize(150, Jimp.AUTO);

    const convertedBuffer = await image.getBufferAsync(Jimp.MIME_JPEG);

    await s3.putObject({
        Bucket: thumbnailBucketName,
        Key: key,
        Body: convertedBuffer
    }).promise();

    
}

export const main = resizeToThumbnail;
