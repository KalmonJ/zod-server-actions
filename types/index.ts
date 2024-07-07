import { z } from "zod";

export type HandlerFn<T, R> = (input: T) => Promise<R>;

export type HandlerProps<T, O> = HandlerBaseProps<T, O> & RetryProps;

type HandlerBaseProps<T, O> = {
  input?: z.ZodType<T>;
  output?: z.ZodType<O>;
};

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
