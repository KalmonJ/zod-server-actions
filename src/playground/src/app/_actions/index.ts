"use server";

import { z } from "zod";
import { handler } from "@/lib/server";
import { client } from "../_client/client";

export const createUserAction = handler
  .input(z.instanceof(FormData))
  .handler(async (input) => {
    const response = await client.users.createUser(input);
    console.log(response, "RESPOSTA");
  });
