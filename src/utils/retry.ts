import type { MakeRetries } from "../types";
import { sleep } from "./sleep";

export async function makeRetries<T, R, TContext>({
  cb,
  delay = 1,
  input,
  maximumAttempts = 0,
  context,
}: MakeRetries<T, R, TContext>) {
  for (let i = 0; i < maximumAttempts; i++) {
    try {
      const res = await cb(input, context as Awaited<TContext>);
      return res;
    } catch (error) {
      await sleep(delay);
    }
  }

  return null;
}
