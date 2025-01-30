import { ResponseError, ResponseSuccess } from "../types";

export const makeResponseSuccess = <T>(data: T): ResponseSuccess<T> => ({
  data,
  error: null,
  success: true,
});
export const makeResponseError = <T>(error: T): ResponseError<T> => ({
  error,
  data: null,
  success: false,
});

export type ActionResponse<S, E = unknown> = ResponseSuccess<S> | ResponseError<E>;
