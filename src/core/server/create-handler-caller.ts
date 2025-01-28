// import _ from "lodash";
// import {
//   isRequestFormData,
//   isRequestQuery,
//   isResponseError,
// } from "../../types/guards";
// import { Handler } from "../../types";

// export type JSONRoutes = { [key: string]: JSONRoutes } | Handler;

// type CreateProxyHandlerConfig<T extends JSONRoutes> = {
//   routes: T;
// };

// function generateClientRoutes(
//   from: JSONRoutes,
//   baseKey: string,
//   to: Record<string, unknown>,
// ) {
//   const keys = Object.entries(from);

//   keys.forEach(([baseRouteKey, value]) => {
//     if (_.isObject(value) && !_.isFunction(value)) {
//       generateClientRoutes(value as JSONRoutes, baseRouteKey, to);
//     } else {
//       to[baseKey + "." + baseRouteKey] = {
//         type: value.prototype.type,
//       };
//     }
//   });

//   return to;
// }

// async function handleRequestFormData(req: Request, handler: Handler) {
//   const form = await req.formData();
//   const response = await handler(form);

//   if (isResponseError(response)) {
//     return new Response(JSON.stringify(response), {
//       status: 500,
//     });
//   }

//   if (response.data instanceof ReadableStream) {
//     return new Response(response.data, {
//       status: 200,
//       headers: {
//         "Content-Type": "application/octet-stream",
//         "Transfer-Encoding": "chunked",
//       },
//     });
//   }

//   return new Response(JSON.stringify(response), {
//     status: 200,
//   });
// }

// async function handleRequestQuery(handler: Function) {
//   const response = await handler();
//   return new Response(JSON.stringify(response), {
//     status: 200,
//   });
// }

// async function handleRequestMutation(req: Request, handler: Handler) {
//   const input = await req.json();
//   const response = await handler(input);
//   return new Response(JSON.stringify(response), {
//     status: 200,
//   });
// }

// async function handleRequestRoutes(clientRoutes: Record<string, unknown>) {
//   return new Response(JSON.stringify(clientRoutes), {
//     status: 200,
//   });
// }

// export function createHandlerCaller<T extends JSONRoutes>({
//   routes,
// }: CreateProxyHandlerConfig<T>) {
//   const clientRoutes = generateClientRoutes(routes, "", {});

//   async function handler(req: Request) {
//     const url = new URL(req.url);
//     const pathname = url.pathname;
//     const path = pathname.split("/").filter(Boolean).slice(2).join(".");

//     if (pathname === "/api/handlers/routes") {
//       return handleRequestRoutes(clientRoutes);
//     }

//     try {
//       const type = req.headers.get("Content-Type");
//       const handler = _.get(routes, path);

//       if (!handler) throw new Error("Not found");

//       if (isRequestFormData(type)) {
//         return await handleRequestFormData(req, handler);
//       }

//       if (isRequestQuery(req.method)) {
//         return await handleRequestQuery(handler);
//       }

//       return await handleRequestMutation(req, handler);
//     } catch (error: any) {
//       console.log(error, "CALLER ERROR");
//       return new Response(JSON.stringify({ data: null, error: error.message }));
//     }
//   }
//   return { handler };
// }
