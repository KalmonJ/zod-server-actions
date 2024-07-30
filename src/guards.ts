import { ResponseError } from "./types";

export function isNullResponse(res: unknown): res is null {
  return res === null;
}

export function isResponseError(res: unknown): res is ResponseError {
  return (res as ResponseError).error !== null;
}
