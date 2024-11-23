import { createHandlerCaller } from "../../../../../../core/server/create-handler-caller";
import { routes } from "../../../_routes/routes";

const { handler } = createHandlerCaller({
  routes,
});

export { handler as GET, handler as POST };
