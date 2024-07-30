import { z } from "zod";

export class Parser {
  execute<T>(schema: z.ZodType<T>, data: FormData | any) {
    if (data instanceof FormData) {
      const formValues = this.parseFormData(data);
      return schema.parse(formValues);
    }
    return schema.parse(data);
  }

  parseFormData(formData: FormData) {
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
