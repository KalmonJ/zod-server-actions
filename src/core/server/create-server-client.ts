import _ from "lodash";

type ClientConfig = {
  apiUrl: string;
};

export async function createServerClient<R extends object>(
  clientConfig: ClientConfig,
) {
  try {
    const response = await fetch(`${clientConfig.apiUrl}/handlers/routes`);

    if (!response.ok) throw new Error(response.statusText);

    const routes = (await response.json()) as R;
    const entries = Object.entries(routes);
    let clientRoutes = {} as R;

    entries.forEach(([key, metadata]) => {
      const path = key.split(".").join("/");

      if (metadata.type === "mutation") {
        _.setWith(clientRoutes, key, async function (input: unknown) {
          if (input instanceof FormData) {
            const response = await fetch(
              `${clientConfig.apiUrl}/handlers/${path}`,
              {
                method: "POST",
                body: input,
              },
            );

            if (!response.ok) {
              return {
                data: null,
                error: response.statusText,
              };
            }

            return {
              data: response.body,
              error: null,
            };
          }

          const response = await fetch(
            `${clientConfig.apiUrl}/handlers/${path}`,
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify(input),
            },
          );

          const data = await response.json();
          return data;
        });
      } else {
        _.setWith(clientRoutes, key, async function () {
          const response = await fetch(
            `${clientConfig.apiUrl}/handlers/${path}`,
          );
          console.log(response, "RESPOSTA");
          const data = await response.json();
          return data;
        });
      }
    });
    return clientRoutes as R;
  } catch (error) {
    return {} as R;
  }
}
