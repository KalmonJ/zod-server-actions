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
  uploadAvatar: handler
    .input(z.instanceof(FormData))
    .handler(async (input, ctx) => {
      const file = input.get("file") as File;

      if (!ctx) throw new Error("No context provided");

      return await ctx.provider.chunkUpload(
        file,
        process.env.BUCKET_NAME!,
        file.name,
      );
    }),
} satisfies ActionRoutes;
