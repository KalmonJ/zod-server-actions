import { routes } from "@/app/_routes/routes";
import { createProxyHandler } from "../../../../../core/server/create-proxy-handler";

export const { handler } = createProxyHandler({
  routes,
});

export { handler as GET, handler as POST };
