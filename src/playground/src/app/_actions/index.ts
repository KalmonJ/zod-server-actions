"use server";

import { z } from "zod";
import { handler } from "@/lib/server";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

export const uploadFile = handler
  .input(z.instanceof(FormData))
  .handler(async (input) => {
    const file = input.get("file") as File;

    const client = new S3Client({
      region: "sa-east-1",
      credentials: {
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
        accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
      },
    });

    const params = {
      Bucket: process.env.BUCKET_NAME!,
      Key: file.name,
      ContentType: "text/plain",
    };

    const command = new PutObjectCommand(params);

    const presignedUrl = await getSignedUrl(client, command, {
      expiresIn: 3600,
    });

    const response = await fetch(presignedUrl, {
      method: "PUT",
      headers: {
        "Content-Length": file.size.toString(),
      },
      body: file,
    });

    if (!response.ok) {
      throw new Error(response.statusText);
    }

    return {
      success: true,
    };
  });

// meubucketest
