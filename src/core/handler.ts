import { z, ZodTypeAny } from "zod";
import { CreateHandlerProps, HandlerFn } from "../types";
import { ActionResponse, makeResponseError, makeResponseSuccess } from "./response";
import { makeRetries } from "../utils";
import { logger } from "./logger";

type HandlerProps<T extends ZodTypeAny, C extends object, R> = CreateHandlerProps<
  HandlerFn<T, C, R>,
  C
>;

export type HandlerReturn<I extends ZodTypeAny, R> = (
  input: z.infer<I>,
) => Promise<ActionResponse<R>>;

export class Handler {
  private constructor() {}

  static create<I extends ZodTypeAny, C extends object, R>(props: HandlerProps<I, C, R>) {
    if (!props.validator.inputSchema) throw new Error("Missing input schema");

    return async function <V extends I>(input: V) {
      const inputData = props.validator.parseInput(input);
      try {
        const data = await props.cb(inputData, props.config!.context!);

        if (props.validator.outputSchema) {
          const outputData = props.validator.parseOutput(data);

          return makeResponseSuccess(outputData);
        }

        if (props.config && props.config.debug)
          logger.debug("Request handler success: ", data);

        return makeResponseSuccess(data);
      } catch (error) {
        if (!props.config) return makeResponseError(error);

        if (props.config.onError) {
          await props.config.onError(error);
        }

        if (props.config.debug) logger.error("Request handler error: ", error);

        if (props.config.retries) {
          const result = await makeRetries({
            cb: props.cb,
            config: props.config,
            input: inputData,
          });

          if (!result) return makeResponseError(error);
          if (!props.validator.outputSchema) return makeResponseSuccess(result);

          const outputData = props.validator.parseOutput(result);

          return makeResponseSuccess(outputData);
        }

        return makeResponseError(error);
      }
    };
  }
}
