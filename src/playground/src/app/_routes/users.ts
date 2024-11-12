import { handler } from "@/lib/server";
import { ActionRoutes } from "../../../../types";
import { z } from "zod";

export const usersRoutes = {
  createUser: handler.input(z.any()).handler(async (input) => {
    console.log(input, "FILE API ROUTE");
    return {
      success: true,
    };
  }),
} satisfies ActionRoutes;
