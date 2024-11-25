import {
  presignedUrlUpload as presignedUpload,
  S3Config,
  RequestPresigningArguments,
} from "./url-presigned-upload";
import { lookup } from "mime-types";

import { chunkUpload as awsChunkUpload } from "./chunk-upload";

type AWSProviderProps = {
  SECRET_KEY: string;
  REGION: string;
  ACCESS_KEY_ID: string;
};

type UploadBaseProps = {
  file: File | null;
  bucket: string;
  key: string;
};

interface UrlPresignedUploadProps extends UploadBaseProps {
  options?: RequestPresigningArguments;
}

export class AWSProvider {
  private readonly SECRET_KEY: string = "";
  private readonly REGION: string = "";
  private readonly ACCESS_KEY_ID: string = "";

  constructor(props: AWSProviderProps) {
    Object.assign(this, props);
  }

  async presignedUrlUpload({
    bucket,
    file,
    key,
    options,
  }: UrlPresignedUploadProps) {
    const params = {
      object: {
        Bucket: bucket,
        Key: key,
      },
      credentials: {
        accessKeyId: this.ACCESS_KEY_ID,
        secretAccessKey: this.SECRET_KEY,
      },
      region: this.REGION,
    } satisfies S3Config;

    return await presignedUpload(file, params, options);
  }

  async chunkUpload({ bucket, file, key }: UploadBaseProps) {
    if (!file) throw new Error("File must required!");

    const params = {
      object: {
        Bucket: bucket,
        Key: key,
      },
      credentials: {
        accessKeyId: this.ACCESS_KEY_ID,
        secretAccessKey: this.SECRET_KEY,
      },
      region: this.REGION,
    } satisfies S3Config;

    const stream = await awsChunkUpload(file, params);

    return stream;
  }
}
