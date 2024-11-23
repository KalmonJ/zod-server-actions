/* eslint-disable @typescript-eslint/no-explicit-any */
import { S3Client } from "@aws-sdk/client-s3";
import { Upload } from "@aws-sdk/lib-storage";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;

    // Verifica se o arquivo existe
    if (!file) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    const params = {
      Bucket: process.env.BUCKET_NAME!,
      Key: file.name,
      Body: file.stream(), // Use a stream do arquivo diretamente
    };

    const upload = new Upload({
      client: new S3Client({
        region: "sa-east-1",
        credentials: {
          accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
          secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
        },
      }),
      params,
    });

    // Captura progresso do upload
    const progressStream = new ReadableStream({
      start(controller) {
        upload.on("httpUploadProgress", (progress) => {
          controller.enqueue(Buffer.from(JSON.stringify(progress), "utf-8"));
          console.log(progress, "progresso");
        });
        upload.done().then(() => controller.close());
      },
    });

    return new Response(progressStream, {
      headers: {
        "Content-Type": "application/octet-stream",
        "Transfer-Encoding": "chunked",
      },
    });
  } catch (error: any) {
    console.error("Error during file upload:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
