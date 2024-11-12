import { handler } from "@/lib/server";
import { ActionRoutes } from "../../../../types";

export const postsRoutes = {
  getPost: handler.query(async (input, ctx) => {
    console.log(input, ctx);
  }),
} satisfies ActionRoutes;
