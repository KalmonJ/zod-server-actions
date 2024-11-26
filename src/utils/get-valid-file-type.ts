import { lookup } from "mime-types";

export const getValidFileType = (
  file: File | null,
  acceptedTypes?: string[],
) => {
  if (!file) {
    throw new Error("No file provided.");
  }

  if (!acceptedTypes || acceptedTypes.length === 0) {
    throw new Error("No list of accepted file types provided.");
  }

  const detectedMimeType = lookup(file.name);

  if (!detectedMimeType) {
    throw new Error(
      `Unable to determine the MIME type of the file "${file.name}".`,
    );
  }

  const normalizedAcceptedTypes = acceptedTypes.map((type) =>
    type.toLowerCase(),
  );

  const isMimeTypeValid = normalizedAcceptedTypes.includes(detectedMimeType);
  const isExtensionValid = normalizedAcceptedTypes.some((type) =>
    file.name.toLowerCase().endsWith(type),
  );

  if (!isMimeTypeValid && !isExtensionValid) {
    throw new Error(
      `The file type "${detectedMimeType}" is not accepted. Allowed types: ${acceptedTypes.join(
        ", ",
      )}.`,
    );
  }

  return detectedMimeType;
};
