import { Handler, createActionHandler } from "../src";
import { z } from "zod";

const handler = createActionHandler();

const fakeSchema = z.object({
  name: z.string(),
  email: z.string(),
});

describe("handler test suit", () => {
  test("Should receive a schema", () => {
    const output = handler.input(fakeSchema);
    expect(output.props.schema).toStrictEqual(fakeSchema);
    expect(output).toBeInstanceOf(Handler);
  });

  test("Should create a new function", () => {
    const func = handler.input(fakeSchema).procedure(async (data) => {
      return data;
    });
    expect(func).toBeTruthy();
  });

  test("Should receive a formData ", async () => {
    const func = handler.input(fakeSchema).procedure(async (data) => {
      return data;
    });

    const formData = new FormData();
    formData.append("name", "jhon");
    formData.append("email", "email@email.com");
    const response = await func(formData);
    expect(response).toBeTruthy();
  });
});
