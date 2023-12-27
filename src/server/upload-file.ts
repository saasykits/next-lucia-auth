import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
} from "@aws-sdk/client-s3";
import { env } from "@/env";

const s3Client = new S3Client({
  region: env.AWS_S3_REGION,
  credentials: {
    accessKeyId: env.AWS_S3_ACCESS_KEY_ID,
    secretAccessKey: env.AWS_S3_SECRET_ACCESS_KEY,
  },
});

type UploadFileFn = (params: {
  name: string;
  type: string;
  buffer: Buffer;
}) => Promise<
  { status: "success"; url: string; key: string } | { status: "error" }
>;

export const uploadFileToS3: UploadFileFn = async ({ name, type, buffer }) => {
  const key = `v2/${Date.now().toString()}-${name}`;
  const command = new PutObjectCommand({
    Bucket: env.AWS_S3_BUCKET,
    Key: key,
    Body: buffer,
    ContentType: type,
    ACL: "public-read",
  });

  try {
    await s3Client.send(command);
    return {
      status: "success",
      url: `https://${env.AWS_S3_BUCKET}.s3.${env.AWS_S3_REGION}.amazonaws.com/${key}`,
      key,
    };
  } catch (error) {
    console.error(error);
    return { status: "error" };
  }
};

export async function deleteFileFromS3(Key: string) {
  const command = new DeleteObjectCommand({ Bucket: env.AWS_S3_BUCKET, Key });
  await s3Client.send(command);
}
