import { ZodSchema } from "zod";

type CallbackProcedure<T, R> = (input: T) => Promise<R>;

type HandlerProps<T> = {
  schema: ZodSchema<T> | null;
  parser: Parser;
};

export class Handler<T> {
  constructor(public props: HandlerProps<T>) {}

  input<S extends T>(schema: ZodSchema<S>): Handler<S> {
    return new Handler<S>({
      schema,
      parser: this.props.parser,
    });
  }

  procedure<R>(callback: CallbackProcedure<T, R>) {
    const schema = this.props.schema;
    if (!schema) throw new Error("zod schema must be provided");

    return async (formData: FormData) => {
      const output = this.props.parser.execute<T>(schema, formData);

      try {
        const response = await callback(output);
        return {
          data: response,
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
  return new Handler({
    schema: null,
    parser: new Parser(),
  });
};
