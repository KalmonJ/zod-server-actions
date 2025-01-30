import { Config } from "./config";
import { ZodValidator } from "./validators";
import { z, ZodTypeAny } from "zod";
import { HandlerFn, QueryFn } from "../types";
import { createAction, HandlerReturn } from "./handler";
import { Query, QueryReturn } from "./query";
import { RetriesConfig } from "./handler-factory";

export class ActionHandler<
  C extends object,
  I extends ZodTypeAny = any,
  O extends ZodTypeAny = any,
> {
  constructor(
    private readonly validator: ZodValidator,
    private readonly config?: Config<C>,
  ) {}

  input<S extends ZodTypeAny>(schema: S): ActionHandler<C, S, O> {
    this.validator.setInputSchema(schema);
    return new ActionHandler<C, S, O>(this.validator, this.config);
  }

  output<S extends ZodTypeAny>(schema: S): ActionHandler<C, I, S> {
    this.validator.setOutputSchema(schema);
    return new ActionHandler<C, I, S>(this.validator, this.config);
  }

  retry(config: RetriesConfig) {
    if (this.config) {
      this.config.setConfig({ ...this.config, retries: config });
    }
    return new ActionHandler(this.validator, this.config);
  }

  handler<R extends O>(cb: HandlerFn<I, C, R>): HandlerReturn<I, R>;
  handler<R>(cb: HandlerFn<I, C, R>): HandlerReturn<I, z.infer<O>>;
  handler<R>(cb: HandlerFn<I, C, R>) {
    const config = this.config;
    const validator = this.validator;
    return createAction({
      cb,
      config,
      validator,
    });
  }

  query<R extends O>(cb: QueryFn<R, C>): QueryReturn<R>;
  query<R>(cb: QueryFn<R, C>): QueryReturn<z.infer<O>>;
  query<R>(cb: QueryFn<R, C>) {
    const config = this.config;
    const validator = this.validator;
    return Query.create({
      cb,
      config,
      validator,
    });
  }
}
