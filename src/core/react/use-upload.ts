type UploadProgress = {
  loaded: number;
  total: number;
  Key: string;
};

type UseUploadProps = {
  onUploadProgress: (progress: UploadProgress) => void;
};

export const useUpload = ({ onUploadProgress }: UseUploadProps) => {
  return async function (input: ReadableStream) {
    if (!(input instanceof ReadableStream)) return;

    const reader = input.getReader();
    const decoder = new TextDecoder();

    while (true) {
      const { done, value } = await reader.read();

      if (done) break;

      const chunk = decoder.decode(value, { stream: true });
      const data = JSON.parse(chunk) as UploadProgress;
      onUploadProgress(data);
    }
  };
};
