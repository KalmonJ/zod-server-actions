import { z } from "zod";
import { ActionHandler } from "../core/handler";

type HandlerBaseProps<T, O> = {
  input?: z.ZodType<T>;
  output?: z.ZodType<O>;
};

type Config<T, O, TContext> = Partial<HandlerProps<T, O, TContext>> &
  Context<TContext>;

type Context<T = any> = {
  contextFn?: () => Promise<T>;
};

export type HandlerFn<T, R, TContext> = (
  input: T,
  context?: TContext
) => Promise<R>;

export type HandlerProps<T, O, TContext> = HandlerBaseProps<T, O> &
  RetryProps &
  Context<TContext>;

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

export type ActionResponse<T> = Promise<ResponseSuccess<T> | ResponseError>;

export type CallbackFn<S> = (state: S, newItem: S) => S;

export type CreateActionHandler = <T = any, O = any, TContext = any>(
  config?: Config<T, O, TContext>
) => ActionHandler<T, O, TContext>;
