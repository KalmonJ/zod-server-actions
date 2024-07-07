import { useState, useOptimistic } from "react";
import { Parser } from "../utils/parser";

const parser = new Parser();

export const useActionHandler = <T extends (...args: any) => Promise<any>, S>(
  action: T,
  state: S[]
) => {
  const [optimisticItems, addOptimisticItem] = useOptimistic<S[], S>(
    state,
    (items, newItem) => [...items, newItem]
  );

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
