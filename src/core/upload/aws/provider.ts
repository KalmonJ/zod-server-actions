import {
  presignedUrlUpload as presignedUpload,
  S3Config,
  RequestPresigningArguments,
} from "./url-presigned-upload";
import { getValidFileType } from "../../../utils";

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
  accept: string[];
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
    accept,
    bucket,
    file,
    key,
    options,
  }: UrlPresignedUploadProps) {
    if (!file) throw new Error("File must required!");

    const fileType = getValidFileType(accept, file);

    const params = {
      object: {
        Bucket: bucket,
        Key: key,
        ContentType: fileType,
      },
      credentials: {
        accessKeyId: this.ACCESS_KEY_ID,
        secretAccessKey: this.SECRET_KEY,
      },
      region: this.REGION,
    } satisfies S3Config;

    return await presignedUpload(file, params, options);
  }

  async chunkUpload({ accept, bucket, file, key }: UploadBaseProps) {
    if (!file) throw new Error("File must required!");

    const fileType = getValidFileType(accept, file);

    const params = {
      object: {
        Bucket: bucket,
        Key: key,
        ContentType: fileType,
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
