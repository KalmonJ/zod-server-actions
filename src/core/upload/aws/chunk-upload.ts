import { PutObjectCommandInput, S3Client } from "@aws-sdk/client-s3";
import { Upload } from "@aws-sdk/lib-storage";
import { S3Config } from "./url-presigned-upload";

export async function chunkUpload(file: File | null, s3Config: S3Config) {
  if (!file) throw new Error("File is required");

  const client = new S3Client(s3Config);

  const params = {
    ...s3Config.object,
    Body: file.stream(),
  } satisfies PutObjectCommandInput;

  const upload = new Upload({ client, params });

  const progressStream = new ReadableStream({
    start(controller) {
      upload.on("httpUploadProgress", (progress) => {
        controller.enqueue(
          Buffer.from(
            JSON.stringify({ ...progress, total: file.size }),
            "utf-8",
          ),
        );
      });

      upload.done().then(() => controller.close());
    },
  });

  return progressStream;
}
