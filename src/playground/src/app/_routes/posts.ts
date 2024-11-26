import { handler } from "@/lib/server";
import { JSONRoutes } from "../../../../core/server/create-handler-caller";

export const postsRoutes = {
  getPost: handler.query(async (input, ctx) => {
    console.log(input, ctx);
    return [{ title: "hello world", descrption: "lorem" }];
  }),
} satisfies JSONRoutes;
