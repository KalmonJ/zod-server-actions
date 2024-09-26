import { type ZodTypeAny, z } from "zod";
import type {
  ActionResponse,
  CreateActionHandler,
  HandlerFn,
  HandlerProps,
  RetryProps,
} from "../types";
import { isNullResponse } from "../guards";
import { Parser } from "../utils/parser";
import { makeRetries } from "../utils/retry";

export class ActionHandler<T, O, TContext> {
  private context: TContext = {} as TContext;

  constructor(
    private readonly props: Partial<HandlerProps<T, O, TContext>> = {},
    private readonly parser: Parser
  ) {
  }

  input<S extends ZodTypeAny>(schema: S) {
    return new ActionHandler<z.infer<S>, O, TContext>(
      {
        ...this.props,
        input: schema,
      },
      this.parser
    );
  }

  output<S extends ZodTypeAny>(schema: S) {
    return new ActionHandler<T, z.infer<S>, TContext>(
      {
        ...this.props,
        output: schema,
      },
      this.parser
    );
  }

  retry({ maximumAttempts, delay }: RetryProps) {
    return new ActionHandler<T, O, TContext>(
      {
        ...this.props,
        maximumAttempts,
        delay,
      },
      this.parser
    );
  }

  handler<R extends O>(
    callback: HandlerFn<T, R, TContext>
  ): <V>(values: V) => Promise<ActionResponse<R>>;
  handler<R>(
    callback: HandlerFn<T, R, TContext>
  ): <V>(values: V) => Promise<ActionResponse<O>>;
  handler<R>(callback: HandlerFn<T, R, TContext>) {
    const input = this.props.input;
    if (!input) throw new Error("zod schema must be provided");

    return async <V>(values: V): Promise<ActionResponse<any>> => {
      const inputData = this.parser.execute(input, values);

      try {
        await this.createContext();

        const res = await callback(inputData, this.context);

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
        const data = await makeRetries({ ...this.props, cb: callback, context: this.context, input: inputData })

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


  private async createContext() {
    if (!this.props.contextFn) return;
    const context = await this.props.contextFn();
    this.context = context;
  }
}

export const createActionHandler: CreateActionHandler = (config) => {
  const parser = new Parser();
  return new ActionHandler(config, parser);
};