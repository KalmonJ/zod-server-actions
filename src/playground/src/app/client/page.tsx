"use client";

import { client } from "../_client/client";
import { useUpload } from "../../../../core/react/use-upload";
import { isResponseError } from "../../../../guards";

export default function Page() {
  const upload = useUpload({
    onUploadProgress(progress) {
      console.log(progress, "PROGRESSO");
    },
  });

  return (
    <main>
      <form
        onSubmit={async (event) => {
          event.preventDefault();

          const formData = new FormData(event.target as HTMLFormElement);
          const res = await client.users.uploadAvatar(formData);

          if (isResponseError(res)) {
            console.log("Error", res);
            return;
          }

          upload(res.data);
        }}
      >
        <input type="file" name="file" required />
        <button type="submit">Send</button>
      </form>
    </main>
  );
}
