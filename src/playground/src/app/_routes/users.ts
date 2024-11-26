import { handler } from "@/lib/server";
import { JSONRoutes } from "../../../../core/server/create-handler-caller";
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

      return await ctx.provider.chunkUpload({
        file,
        bucket: process.env.BUCKET_NAME!,
        key: file.name,
      });
    }),
} satisfies JSONRoutes;
