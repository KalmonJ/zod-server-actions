import { ResponseError } from ".";

export function isResponseError(res: unknown): res is ResponseError {
  return (res as ResponseError).error !== null;
}

export function isRequestQuery(method: string): method is "GET" {
  return method === "GET";
}

export function isRequestMutation(method: string): method is "POST" {
  return method === "POST";
}

export function isRequestFormData(type: string | null) {
  return type && type.includes("form-data");
}
