import { ActionHandler, Config } from "../core";

export type HandlerFn<T, R, TContext> = (
  input: T,
  context?: Awaited<Config<TContext>["context"]>,
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

export type ActionResponse<T> = Promise<ResponseSuccess<T> | ResponseError>;

export type CallbackFn<S> = (state: S, newItem: S) => S;

export type Handler = ReturnType<ActionHandler<any>["handler"]>;

export type ActionRoutes = {
  [x: string]: Handler;
};

export type MakeRetries<T, R, TContext> = {
  cb: HandlerFn<T, R, TContext>;
  input: T;
  maximumAttempts?: number;
  delay?: number;
  context?: TContext;
};
