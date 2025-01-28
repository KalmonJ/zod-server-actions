import { z, ZodTypeAny } from "zod";
import { CreateHandlerProps, HandlerFn } from "../types";
import { ActionResponse, ResponseError, ResponseSuccess } from "./response";
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
          return ResponseSuccess.create(outputData);
        }

        if (props.config && props.config.debug)
          logger.debug("Request handler success: ", data);

        return ResponseSuccess.create(data);
      } catch (error) {
        if (!props.config) return ResponseError.create(error);

        if (props.config.debug) logger.error("Request handler error: ", error);

        if (props.config.retries) {
          const result = await makeRetries({
            cb: props.cb,
            config: props.config,
            input: inputData,
          });

          if (!result) return ResponseError.create(error);
          if (!props.validator.outputSchema) return ResponseSuccess.create(result);

          const outputData = props.validator.parseOutput(result);
          return ResponseSuccess.create(outputData);
        }

        if (props.config.onError) {
          await props.config.onError(error);
          return ResponseError.create(error);
        }

        return ResponseError.create(error);
      }
    };
  }
}
