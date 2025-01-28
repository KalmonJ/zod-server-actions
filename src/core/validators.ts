import { z, ZodTypeAny } from "zod";

export class ZodValidator<I extends ZodTypeAny = any, O extends ZodTypeAny = any> {
  inputSchema: I;
  outputSchema: O;

  constructor() {}

  parseInput<T>(data: T): z.infer<I> {
    return this.inputSchema.parse(data);
  }

  parseOutput<T>(data: T): z.infer<O> {
    return this.outputSchema.parse(data);
  }

  setInputSchema(schema: I) {
    this.inputSchema = schema;
  }

  setOutputSchema(schema: O) {
    this.outputSchema = schema;
  }
}
