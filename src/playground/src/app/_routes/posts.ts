import { handler } from "@/lib/server";
import { JSONRoutes } from "../../../../core/server/create-handler-caller";
import { z } from "zod";

export const postsRoutes = {
  getPost: handler
    .input(z.object({ test: z.string() }))
    .query(async (input, ctx) => {
      console.log(input, ctx);
      return [{ title: "hello world", descrption: "lorem" }];
    }),
} satisfies JSONRoutes;
