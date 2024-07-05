import { ZodSchema, ZodTypeAny, z } from "zod";
import { isNullResponse } from "./guards";

type CallbackProcedure<T, R> = (input: T) => Promise<R>;

type HandlerProps<T, O> = {
  input?: z.ZodType<T>;
  output?: z.ZodType<O>;
} & RetryProps;

type RetryProps = {
  maximumAttempts: number;
  delay: number;
};

export class ActionHandler<T, O> {
  constructor(private props: HandlerProps<T, O>, private parser: Parser) {}

  input<S extends ZodTypeAny>(schema: S) {
    return new ActionHandler<z.infer<S>, O>(
      {
        input: schema as z.ZodType<S>,
        delay: this.props.delay,
        maximumAttempts: this.props.maximumAttempts,
      },
      this.parser
    );
  }

  output<S extends ZodTypeAny>(schema: S) {
    return new ActionHandler<T, z.infer<S>>(
      {
        input: this.props.input as z.ZodType<T>,
        output: schema as z.ZodType<S>,
        delay: this.props.delay,
        maximumAttempts: this.props.maximumAttempts,
      },
      this.parser
    );
  }

  retry({ maximumAttempts, delay }: RetryProps) {
    return new ActionHandler<T, O>(
      {
        input: this.props.input,
        output: this.props.output,
        maximumAttempts,
        delay,
      },
      this.parser
    );
  }

  procedure<R extends O = O>(callback: CallbackProcedure<T, R>) {
    const input = this.props.input;
    if (!input) throw new Error("zod schema must be provided");

    return async <T>(
      values: T
    ): Promise<{ data: R; error: null } | { data: null; error: string }> => {
      const inputData = this.parser.execute(input, values);

      try {
        const res = await callback(inputData);

        if (!this.props.output) {
          return {
            data: res,
            error: null,
          };
        }

        const outputData = this.parser.execute(this.props.output, res);

        return {
          data: outputData as R,
          error: null,
        };
      } catch (error: any) {
        const data = await this.retryAction(
          callback,
          inputData,
          this.props.maximumAttempts,
          this.props.delay
        );

        if (isNullResponse(data)) {
          return {
            data: null,
            error: error.message as string,
          };
        }

        if (this.props.output) {
          const outputData = this.parser.execute(this.props.output, data);
          return {
            data: outputData as R,
            error: null,
          };
        }

        return {
          data,
          error: null,
        };
      }
    };
  }

  private async retryAction<R>(
    callback: CallbackProcedure<T, R>,
    input: T,
    maximumAttempts: number,
    delay: number
  ) {
    for (let i = 0; i < maximumAttempts; i++) {
      console.log("trying again...");
      try {
        const res = await callback(input);
        return res;
      } catch (error) {
        await sleep(delay);
      }
    }
    return null;
  }
}

async function sleep(delay: number) {
  await new Promise((resolve) => {
    setTimeout(resolve, delay * 1000);
  });
}

class Parser {
  execute<T>(schema: z.ZodType<T>, data: FormData | any) {
    if (data instanceof FormData) {
      const formValues = this.parseFormData(data);
      return schema.parse(formValues);
    }
    return schema.parse(data);
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
  const parser = new Parser();
  return new ActionHandler(
    {
      delay: 0,
      maximumAttempts: 0,
    },
    parser
  );
};
