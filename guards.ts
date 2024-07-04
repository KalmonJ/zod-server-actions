import { RetryResponse } from ".";

export function isNullResponse<R, O>(res: RetryResponse<R, O>): res is null {
  return typeof res === null;
}
