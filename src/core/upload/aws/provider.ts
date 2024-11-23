import {
  presignedUrlUpload as presignedUpload,
  S3Config,
  RequestPresigningArguments,
} from "./presigned-upload";

import { chunkUpload as awsChunkUpload } from "./chunk-upload";

type AWSProviderProps = {
  SECRET_KEY: string;
  REGION: string;
  ACCESS_KEY_ID: string;
};

export class AWSProvider {
  private readonly SECRET_KEY: string;
  private readonly REGION: string;
  private readonly ACCESS_KEY_ID: string;

  constructor(props: AWSProviderProps) {
    Object.assign(this, props);
  }

  presignedUrlUpload(
    file: File | null,
    bucket: string,
    key: string,
    options?: RequestPresigningArguments,
  ) {
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

    return presignedUpload(file, params, options);
  }

  chunkUpload(file: File | null, bucket: string, key: string) {
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

    return awsChunkUpload(file, params);
  }
}
