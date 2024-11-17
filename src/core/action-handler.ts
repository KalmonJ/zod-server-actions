import { ZodError, ZodType, type ZodTypeAny, z } from "zod";
import type { ActionResponse, HandlerFn } from "../types";
import { makeRetries } from "../utils/retry";
import { Config, Retries } from "./handler-factory";
import { formatZodErrors } from "../utils/format-zod-errors";

export class ActionHandler<
  C extends Config,
  I extends ZodType = any,
  O extends ZodType = any,
> {
  private config: Config<C>;
  private inputSchema?: ZodType<I>;
  private outputSchema?: ZodType<O>;

  constructor(config: Config<C>, input?: ZodType<I>, output?: ZodType<O>) {
    this.config = config;
    this.inputSchema = input;
    this.outputSchema = output;
  }

  input<S extends ZodTypeAny>(schema: S) {
    return new ActionHandler<C, z.infer<S>, O>(
      this.config,
      schema,
      this.outputSchema,
    );
  }

  output<S extends ZodTypeAny>(schema: S) {
    return new ActionHandler<C, I, z.infer<S>>(
      this.config,
      this.inputSchema,
      schema,
    );
  }

  retry(config: Retries) {
    this.config.retries = config;
    return new ActionHandler<C, I, O>(
      this.config,
      this.inputSchema,
      this.outputSchema,
    );
  }

  handler<R extends O>(
    callback: HandlerFn<I, R, C["context"]>,
  ): <V extends I>(values: V) => Promise<ActionResponse<R>>;
  handler<R>(
    callback: HandlerFn<I, R, C["context"]>,
  ): <V extends I>(values: V) => Promise<ActionResponse<O>>;
  handler<R>(callback: HandlerFn<I, R, C["context"]>) {
    const input = this.inputSchema;
    const outputSchema = this.outputSchema;
    const parseOutput = this.parseOutput.bind(this);
    const errorHandler = this.errorHandler.bind(this);
    const getContext = this.getContext.bind(this);

    const handlerResponse = async function <V extends I>(
      values: V,
    ): Promise<ActionResponse<any>> {
      const ctx = await getContext();

      try {
        const res = input
          ? await callback(input.parse(values), ctx)
          : await callback(values, ctx);
        return parseOutput(res, outputSchema);
      } catch (error: any) {
        return errorHandler(values, error, callback, ctx);
      }
    };

    handlerResponse.prototype = { type: "mutation" };

    return handlerResponse;
  }

  query<R extends O>(
    callback: HandlerFn<I | undefined, R, C["context"]>,
  ): () => Promise<ActionResponse<R>>;
  query<R>(
    callback: HandlerFn<I | undefined, R, C["context"]>,
  ): () => Promise<ActionResponse<O>>;
  query<R>(callback: HandlerFn<I | undefined, R, C["context"]>) {
    const parseOutput = this.parseOutput.bind(this);
    const getContext = this.getContext.bind(this);
    const errorHandler = this.errorHandler.bind(this);

    const queryResponse = async function (): Promise<ActionResponse<any>> {
      const ctx = await getContext();

      try {
        const data = await callback(undefined, ctx);
        return parseOutput(data);
      } catch (error: any) {
        return await errorHandler<R>(undefined, error, callback, ctx);
      }
    };

    queryResponse.prototype = { type: "query" };

    return queryResponse;
  }

  private async getContext() {
    return (await this.config.context) as Awaited<C["context"]>;
  }

  private async errorHandler<R>(
    values: I | undefined,
    error: any,
    cb: HandlerFn<I, R, C["context"]>,
    ctx: Awaited<C["context"]>,
  ) {
    if (error instanceof ZodError) {
      return {
        data: null,
        error: formatZodErrors(error),
      };
    }

    if (!this.config.retries) {
      return {
        data: null,
        error: error.message,
      };
    }

    const data = await makeRetries({
      ...this.config.retries,
      input: values as I,
      context: ctx,
      cb,
    });

    if (!data) {
      return {
        data: null,
        error: error.message,
      };
    }

    return this.parseOutput(data);
  }

  private parseOutput<T, O extends ZodType<O>>(response: T, output?: O) {
    if (!output) {
      return {
        data: response,
        error: null,
      };
    }

    const outputData = output.parse(response);

    return {
      data: outputData,
      error: null,
    };
  }
}
