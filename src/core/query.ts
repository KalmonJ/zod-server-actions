import type { CreateHandlerProps, QueryFn } from "../types";
import { ActionResponse, ResponseError, ResponseSuccess } from "./response";

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
          return ResponseSuccess.create(outputData);
        }
        return ResponseSuccess.create(data);
      } catch (error) {
        if (!props.config) return ResponseError.create(error);

        if (props.config.onError) {
          await props.config.onError(error);
          return ResponseError.create(error);
        }
        return ResponseError.create(error);
      }
    };
  }
}
