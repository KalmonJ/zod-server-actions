import _ from "lodash";
import { isResponseError } from "../../guards";

type CreateProxyHandlerConfig<T extends object> = {
  routes: T;
};

export function createHandlerCaller<T extends object>({
  routes,
}: CreateProxyHandlerConfig<T>) {
  let clientRoutes: any = {};

  function generateClientRoutes(obj: object, baseKey: string) {
    const keys = Object.entries(obj);

    keys.forEach(([baseRouteKey, value]) => {
      if (_.isObject(value) && !_.isFunction(value)) {
        generateClientRoutes(value, baseRouteKey);
      } else {
        clientRoutes[baseKey + "." + baseRouteKey] = {
          type: value.prototype.type,
        };
      }
    });

    return clientRoutes;
  }

  generateClientRoutes(routes, "");

  async function handler(req: Request) {
    const url = new URL(req.url);
    const pathname = url.pathname;
    const path = pathname.split("/").filter(Boolean).slice(2).join(".");

    if (pathname === "/api/handlers/routes") {
      return new Response(JSON.stringify(clientRoutes), {
        status: 200,
      });
    }

    try {
      const type = req.headers.get("Content-Type");
      const handler = _.get(routes, path);

      if (type && type.includes("form-data")) {
        const form = await req.formData();
        const response = await handler(form);

        if (isResponseError(response)) {
          return new Response(JSON.stringify(response), {
            status: 500,
          });
        }

        return new Response(response.data, {
          status: 200,
          headers: {
            "Content-Type": "application/octet-stream",
            "Transfer-Encoding": "chunked",
          },
        });
      }

      if (!handler) throw new Error("Not found");

      if (req.method === "GET") {
        const response = await handler();
        return new Response(JSON.stringify(response), {
          status: 200,
        });
      }

      const input = await req.json();
      const response = await handler(input);

      return new Response(JSON.stringify(response), {
        status: 200,
      });
    } catch (error: any) {
      console.log(error, "CALLER ERROR");
      return new Response(JSON.stringify({ data: null, error: error.message }));
    }
  }
  return { handler };
}
