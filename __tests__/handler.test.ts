import { expect, test, vi } from "vitest";
import { createActionHandler, RetryProps } from "../src";
import { ActionHandler } from "../src/core/handler";
import { z } from "zod";

const handler = createActionHandler();
test("Should create new handler instance", () => {
  expect(handler).toBeInstanceOf(ActionHandler);
});

test("Should input method receive a zod schema", () => {
  vi.spyOn(handler, "input");

  const inputSchema = z.object({ name: z.string() });
  handler.input(inputSchema);

  expect(handler.input).toBeCalledTimes(1);
  expect(handler.input).toBeCalledWith(inputSchema);
});

test("Should output method receive a zod schema", () => {
  vi.spyOn(handler, "output");

  const outputSchema = z.object({ id: z.string() });
  handler.output(outputSchema);

  expect(handler.output).toBeCalledTimes(1);
  expect(handler.output).toBeCalledWith(outputSchema);
});

test("Should retry method receive a config", () => {
  vi.spyOn(handler, "retry");

  const config = {
    delay: 1,
    maximumAttempts: 2,
  } satisfies RetryProps;

  handler.retry(config);

  expect(handler.retry).toBeCalledTimes(1);
  expect(handler.retry).toBeCalledWith(config);
});

test("Should handler method receive a callback function", () => {
  const handler = createActionHandler({
    input: z.object({ name: z.string() }),
  });

  vi.spyOn(handler, "handler");

  const callback = async () => {};

  handler.handler(callback);
  expect(handler.handler).toBeCalledTimes(1);
  expect(handler.handler).toBeCalledWith(callback);
});
