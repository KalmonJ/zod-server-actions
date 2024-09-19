import type { MakeRetries } from "../types";
import { sleep } from "./sleep";

export async function makeRetries<T, R, TContext>({ cb, delay = 1, input, maximumAttempts = 1, context }: MakeRetries<T, R, TContext>) {
  for (let i = 0; i < maximumAttempts; i++) {
    console.log("trying again...");
    try {
      const res = await cb(input, context);
      return res;
    } catch (error) {
      await sleep(delay);
    }
  }

  return null;
}