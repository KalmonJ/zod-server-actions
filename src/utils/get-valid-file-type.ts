import { lookup } from "mime-types";

export const getValidFileType = (accept: string[], file: File) => {
  const fileType = lookup(file.name);

  if (!fileType) throw new Error("Invalid file type!");

  const isValidFile = accept.includes(fileType);

  if (!isValidFile) throw new Error("Invalid file type");

  return fileType;
};
