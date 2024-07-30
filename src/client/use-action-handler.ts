import { useState, useOptimistic } from "react";
import { Parser } from "../utils/parser";
import { CallbackFn } from "../types";

const parser = new Parser();

export const useActionHandler = <
  T extends (...args: any) => Promise<any>,
  S,
  F extends CallbackFn<S>
>(
  action: T,
  state: S,
  fn: F
) => {
  const [optimisticItems, addOptimisticItem] = useOptimistic<S, S>(state, fn);

  const [pending, setPending] = useState(false);

  const handler = async <I extends S | FormData>(input: I) => {
    setPending(true);
    if (input instanceof FormData) {
      const parsedInput = parser.parseFormData(input);
      addOptimisticItem(parsedInput as S);
    } else {
      addOptimisticItem(input as S);
    }
    const res: Awaited<ReturnType<Awaited<T>>> = await action(input);
    setPending(false);
    return res;
  };

  return {
    handler,
    pending,
    optimisticItems,
  };
};
