"use client";

import { uploadFile } from "../_actions";

export default function Page() {
  return (
    <main>
      <form
        action={async (formData) => {
          const data = await uploadFile(formData);
          console.log(data, "Return");
        }}
      >
        <input type="file" name="file" />
        <button>send</button>
      </form>
    </main>
  );
}
