import { z, ZodTypeAny } from "zod";
import { ActionHandler, Config } from "../core";
import type { Context } from "../core/context";
import { ZodValidator } from "../core/validators";

export type HandlerFn<T extends ZodTypeAny, C extends object, R> = (
  input: z.infer<T>,
  context: ContextObject<C>,
) => Promise<R>;

export type RetryProps = {
  maximumAttempts: number;
  delay: number;
};

export type ResponseSuccess<T> = {
  data: T;
  error: null;
};

export type ResponseError = {
  data: null;
  error: string;
};

type ContextObject<C extends object> = Omit<Context<C>, "executeContextFn">;

export type QueryFn<R, C extends object> = (ctx: ContextObject<C>) => Promise<R>;

export type ActionResponse<T> = Promise<ResponseSuccess<T> | ResponseError>;

export type CallbackFn<S> = (state: S, newItem: S) => S;

export type Handler = ReturnType<ActionHandler<any>["handler"]>;

export type ActionRoutes = {
  [x: string]: Handler;
};

export type CreateHandlerProps<H, C extends object> = {
  cb: H;
  config?: Config<C>;
  validator: ZodValidator;
};

export type MakeRetries<C extends object, I extends ZodTypeAny, R> = {
  config: Config<C>;
  cb: HandlerFn<I, C, R>;
  input: z.infer<I>;
};
