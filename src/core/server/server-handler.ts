import { ZodSchema } from "zod";
import { Config } from "../handler-factory";
import { AWSProvider } from "../upload/aws/provider";

type CallbackUpload = (file: File, provider: AWSProvider) => void;

interface ServerHandlerBase<
  C extends ServerConfig,
  I extends ZodSchema,
  O extends ZodSchema,
> {
  input<S extends I>(schema: S): ServerHandler<C, S, O>;
  output<S extends O>(schema: S): ServerHandler<C, I, S>;
  upload(cb: CallbackUpload): void;
  handler(): void;
  query(): void;
  download(): void;
}

interface ServerConfig<C = any> extends Config<C> {
  upload: {
    provider: AWSProvider;
  };
}

export class ServerHandler<
  C extends ServerConfig<C>,
  I extends ZodSchema = any,
  O extends ZodSchema = any,
> implements ServerHandlerBase<C, I, O>
{
  private config: ServerConfig<C>;
  inputSchema?: ZodSchema<I>;
  outputSchema?: ZodSchema<O>;

  constructor(
    config: ServerConfig<C>,
    inputSchema?: ZodSchema<I>,
    outputSchema?: ZodSchema<O>,
  ) {
    this.config = config;
    this.inputSchema = inputSchema;
    this.outputSchema = outputSchema;
  }

  input<S extends I>(schema: S) {
    return new ServerHandler<C, S, O>(this.config, schema, this.outputSchema);
  }
  output<S extends O>(schema: S) {
    return new ServerHandler<C, I, S>(this.config, this.inputSchema, schema);
  }
  upload(cb: CallbackUpload): void {
    throw new Error("Method not implemented.");
  }
  handler(): void {
    throw new Error("Method not implemented.");
  }
  query(): void {
    throw new Error("Method not implemented.");
  }
  download(): void {
    throw new Error("Method not implemented.");
  }
}

const serverHandler = new ServerHandler({
  upload: {
    provider: new AWSProvider({
      ACCESS_KEY_ID: "sdasda",
      REGION: "asdasdas",
      SECRET_KEY: "asdasd",
    }),
  },
});

serverHandler.upload(() => {});
