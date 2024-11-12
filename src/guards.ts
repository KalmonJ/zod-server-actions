import { ResponseError } from "./types";

export function isResponseError(res: unknown): res is ResponseError {
  return (res as ResponseError).error !== null;
}
