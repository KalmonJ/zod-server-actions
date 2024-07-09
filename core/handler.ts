import { type ZodTypeAny, z } from "zod";
import type {
  ActionResponse,
  HandlerFn,
  HandlerProps,
  RetryProps,
} from "../types";
import { isNullResponse } from "../guards";
import { Parser } from "../utils/parser";
import { sleep } from "../utils/sleep";

export class ActionHandler<T, O> {
  constructor(private props: HandlerProps<T, O>, private parser: Parser) {}

  input<S extends ZodTypeAny>(schema: S) {
    return new ActionHandler<z.infer<S>, O>(
      {
        input: schema as z.ZodType<S>,
        delay: this.props.delay,
        maximumAttempts: this.props.maximumAttempts,
      },
      this.parser
    );
  }

  output<S extends ZodTypeAny>(schema: S) {
    return new ActionHandler<T, z.infer<S>>(
      {
        input: this.props.input as z.ZodType<T>,
        output: schema as z.ZodType<S>,
        delay: this.props.delay,
        maximumAttempts: this.props.maximumAttempts,
      },
      this.parser
    );
  }

  retry({ maximumAttempts, delay }: RetryProps) {
    return new ActionHandler<T, O>(
      {
        input: this.props.input,
        output: this.props.output,
        maximumAttempts,
        delay,
      },
      this.parser
    );
  }

  handler<R extends O>(
    callback: HandlerFn<T, R>
  ): (values: T) => Promise<ActionResponse<R>>;
  handler<R>(
    callback: HandlerFn<T, R>
  ): (values: T) => Promise<ActionResponse<O>>;

  handler<R>(callback: HandlerFn<T, R>) {
    const input = this.props.input;
    if (!input) throw new Error("zod schema must be provided");

    return async <T>(values: T): Promise<ActionResponse<any>> => {
      const inputData = this.parser.execute(input, values);

      try {
        const res = await callback(inputData);

        if (!this.props.output) {
          return {
            data: res,
            error: null,
          };
        }

        const outputData = this.parser.execute(this.props.output, res);

        return {
          data: outputData,
          error: null,
        };
      } catch (error: any) {
        const data = await this.retryAction(
          callback,
          inputData,
          this.props.maximumAttempts,
          this.props.delay
        );

        if (isNullResponse(data)) {
          return {
            data: null,
            error: error.message,
          };
        }

        if (this.props.output) {
          const outputData = this.parser.execute(this.props.output, data);
          return {
            data: outputData,
            error: null,
          };
        }

        return {
          data,
          error: null,
        };
      }
    };
  }

  private async retryAction<R>(
    callback: HandlerFn<T, R>,
    input: T,
    maximumAttempts: number,
    delay: number
  ) {
    for (let i = 0; i < maximumAttempts; i++) {
      console.log("trying again...");
      try {
        const res = await callback(input);
        return res;
      } catch (error) {
        await sleep(delay);
      }
    }
    return null;
  }
}

export const createActionHandler = () => {
  const parser = new Parser();
  return new ActionHandler(
    {
      delay: 0,
      maximumAttempts: 0,
    },
    parser
  );
};
