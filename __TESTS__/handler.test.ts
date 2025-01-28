import { z } from "zod";
import { ActionHandlerFactory } from "../src/core/handler-factory";

test("Handler test suite", async () => {
  const handler = ActionHandlerFactory.createActionHandler({
    async onError(error) {
      console.log(error);
    },
    async contextFn() {
      return {
        success: true,
      };
    },
    debug: true,
  });

  const c = handler
    .input(
      z.object({
        name: z.string(),
      }),
    )
    .handler(async (input, ctx) => {});

  await c({ name: "helo" });

  const c1 = handler
    .input(
      z.object({
        age: z.string(),
      }),
    )
    .output(
      z.object({
        success: z.boolean(),
      }),
    )
    .handler(async (input, ctx) => {
      const success = await ctx.get("success");

      return {
        success,
      };
    });

  const result = await c1({ age: "55" });
});
