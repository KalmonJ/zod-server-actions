import type { CreateHandlerProps, QueryFn } from "../types";
import { makeRetries } from "../utils";
import { ActionResponse, makeResponseError, makeResponseSuccess } from "./response";

type QueryProps<R, C extends object> = CreateHandlerProps<QueryFn<R, C>, C>;
export type QueryReturn<R> = () => Promise<ActionResponse<R>>;

export class Query {
  private constructor() {}

  static create<R, C extends object>(props: QueryProps<R, C>) {
    return async function () {
      try {
        const data = await props.cb(props.config!.context!);

        if (props.validator.outputSchema) {
          const outputData = props.validator.parseOutput(data);
          return makeResponseSuccess(outputData);
        }
        return makeResponseSuccess(data);
      } catch (error) {
        if (!props.config) return makeResponseError(error);

        if (props.config.onError) {
          await props.config.onError(error);
        }

        return makeResponseError(error);
      }
    };
  }
}
