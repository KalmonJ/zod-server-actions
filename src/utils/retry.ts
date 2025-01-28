import { ZodTypeAny } from "zod";
import type { MakeRetries } from "../types";
import { sleep } from "./sleep";
import { logger } from "../core/logger";

export async function makeRetries<C extends object, I extends ZodTypeAny, R>(
  props: MakeRetries<C, I, R>,
) {
  if (!props.config || !props.config.retries) return null;

  for (let i = 0; i < props.config.retries.maximumAttempts; i++) {
    try {
      if (props.config.debug) logger.debug("Making request: ", i + 1);
      return await props.cb(props.input, props.config.context!);
    } catch (error: any) {
      if (props.config.debug) logger.error("Request error: ", error.message);
      await sleep(props.config.retries.delay);
    }
  }

  return null;
}
