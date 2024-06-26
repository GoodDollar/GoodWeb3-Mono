import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";

export const uploadToS3 = async (base64: string, filename: string) => {
  const s3 = new S3Client({
    region: "us-east-1",
    signer: { sign: async request => request }
  });

  const res = await s3.send(
    new PutObjectCommand({
      Bucket: "redtent",
      Key: filename,
      Body: Buffer.from(base64, "base64")
    })
  );
  return res;
};
