import { ZodSchema, z } from "zod";
import { isNullResponse } from "./guards";

type CallbackProcedure<T, R> = (input: T) => Promise<R>;

type HandlerProps<T, O> = {
  input?: ZodSchema<T>;
  output?: ZodSchema<O>;
} & RetryProps;

type RetryProps = {
  maximumAttempts: number;
  delay: number;
};

export type RetryResponse<R, O> = Awaited<R> | Awaited<O> | null;

export class ActionHandler<T, O> {
  constructor(private props: HandlerProps<T, O>, private parser: Parser) {}

  input<S extends T>(schema: ZodSchema<S>) {
    return new ActionHandler<S, O>(
      {
        input: schema,
        delay: this.props.delay,
        maximumAttempts: this.props.maximumAttempts,
      },
      this.parser
    );
  }

  output<S extends O>(schema: ZodSchema<S>) {
    return new ActionHandler<T, S>(
      {
        input: this.props.input,
        output: schema,
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

  procedure<R>(callback: CallbackProcedure<T, R>) {
    const input = this.props.input;
    if (!input) throw new Error("zod schema must be provided");

    return async (formData: FormData) => {
      const inputData = this.parser.execute<T>(input, formData);

      try {
        const res = await callback(inputData);

        if (!this.props.output) {
          return {
            data: res,
            error: null,
          };
        }

        const outputData = this.parser.execute<O>(this.props.output, res);

        return {
          data: outputData,
          error: null,
        };
      } catch (error: any) {
        const data = await this.retryAction<R>(
          callback,
          inputData,
          this.props.maximumAttempts,
          this.props.delay
        );

        if (isNullResponse<R, O>(data)) {
          return {
            data: null,
            error: error.message as string,
          };
        }

        if (this.props.output) {
          const outputData = this.parser.execute(this.props.output, data);
          return {
            data: outputData,
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
      console.log("tentando: ", i);
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
  execute<T>(schema: ZodSchema<T>, data: FormData | any) {
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

const schema = z.object({ name: z.string(), price: z.string() });

const handler = createActionHandler();

const func = handler
  .input(schema)
  .output(z.object({ id: z.string() }))
  .retry({
    delay: 500,
    maximumAttempts: 3,
  })
  .procedure(async (data) => {
    throw new Error("Error");
  });

func(new FormData());
