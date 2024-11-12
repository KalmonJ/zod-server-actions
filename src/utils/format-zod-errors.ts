import { ZodError } from "zod";

export function formatZodErrors(error: ZodError) {
  return error.issues.reduce((acc, curr) => {
    switch (curr.code) {
      case "invalid_type": {
        let strError = errorMessage("type", curr.expected, curr.received);
        if (!curr.path.length) {
          acc += strError;
          return acc;
        }

        strError += `, at: ${curr.path.join(", ")}`;
        acc += strError;
        return acc;
      }
      default:
        return error.format()._errors.join(", ");
    }
  }, "Zod error: ");
}

export function errorMessage(type: string, expected: string, received: string) {
  return `invalid ${type}, expected: ${expected}, received: ${received}.`;
}
