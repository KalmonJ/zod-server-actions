import { ZodSchema, z } from "zod";

type CallbackProcedure<T, R> = (input: T) => Promise<R>;

type HandlerProps<T, O> = {
  parser: Parser;
  input?: ZodSchema<T>;
  output?: ZodSchema<O>;
};

export class ActionHandler<T, O> {
  constructor(private props: HandlerProps<T, O>) {}

  input<S extends T>(schema: ZodSchema<S>) {
    return new ActionHandler<S, O>({
      input: schema,
      parser: this.props.parser,
    });
  }

  output<S extends O>(schema: ZodSchema<S>) {
    return new ActionHandler<T, S>({
      parser: this.props.parser,
      input: this.props.input,
      output: schema,
    });
  }

  procedure<R>(callback: CallbackProcedure<T, R>) {
    const input = this.props.input;
    if (!input) throw new Error("zod schema must be provided");

    return async (formData: FormData) => {
      const inputData = this.props.parser.execute<T>(input, formData);

      try {
        const response = await callback(inputData);

        if (!this.props.output) {
          return {
            data: response,
            error: null,
          };
        }

        const outputData = this.props.parser.execute<O>(
          this.props.output,
          formData
        );

        return {
          data: outputData,
          error: null,
        };
      } catch (error: any) {
        return {
          data: null,
          error: error.message,
        };
      }
    };
  }
}

class Parser {
  execute<T>(schema: ZodSchema<T>, formData: FormData) {
    const formValues = this.parseFormData(formData);
    return schema.parse(formValues);
  }

  private parseFormData(formData: FormData) {
    let obj = {};
    formData.forEach((value, key) => {
      Object.defineProperty(obj, key, {
        value: value.toString(),
        writable: true,
      });
    });
    return obj;
  }
}

export const createActionHandler = () => {
  return new ActionHandler({
    parser: new Parser(),
  });
};
