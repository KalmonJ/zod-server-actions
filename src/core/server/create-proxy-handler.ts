import _ from "lodash";

type CreateProxyHandlerConfig<T extends object> = {
  routes: T;
};

export function createProxyHandler<T extends object>({
  routes,
}: CreateProxyHandlerConfig<T>) {
  let fromObj: { [key: string]: unknown } = {};

  function generateClientRoutes(obj: object, baseKey: string) {
    const keys = Object.entries(obj);

    keys.forEach(([baseRouteKey, value]) => {
      if (_.isObject(value) && !_.isFunction(value)) {
        generateClientRoutes(value, baseRouteKey);
      } else {
        fromObj[baseKey + "." + baseRouteKey] = {
          type: value.prototype?.type,
        };
      }
    });

    return fromObj;
  }

  generateClientRoutes(routes, "");

  async function handler(req: Request) {
    const url = new URL(req.url);

    const pathname = url.pathname;
    const path = pathname.split("/").filter(Boolean).slice(1).join(".");

    if (pathname === "/api/routes") {
      return new Response(JSON.stringify(fromObj), {
        status: 200,
      });
    }

    try {
      const handler = _.get(routes, path);

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
      console.log(error, "ERROR PROXY");
      return new Response(JSON.stringify({ data: null, error: error.message }));
    }
  }
  return { handler };
}
