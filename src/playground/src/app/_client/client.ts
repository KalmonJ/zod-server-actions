import { createServerClient } from "../../../../core/server/create-server-client";
import { AppRoutes } from "../_routes/routes";

export const client = await createServerClient<AppRoutes>({
  apiUrl: "http://localhost:3000/api",
});
