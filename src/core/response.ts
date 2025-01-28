export class ResponseError<T> {
  readonly error: T;
  readonly success: false = false;

  private constructor(error: T) {
    this.error = error;
  }

  static create<T>(error: T): ResponseError<T> {
    return new ResponseError(error);
  }
}

export class ResponseSuccess<T> {
  readonly data: T;
  readonly success: true = true;

  private constructor(data: T) {
    this.data = data;
  }

  static create<T>(data: T): ResponseSuccess<T> {
    return new ResponseSuccess(data);
  }
}

export type ActionResponse<S, E = unknown> = ResponseSuccess<S> | ResponseError<E>;
