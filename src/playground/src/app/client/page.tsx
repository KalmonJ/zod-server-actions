"use client";

import { createUserAction } from "../_actions";

export default function Page() {
  return (
    <main>
      <form
        action={async (formData) => {
          const data = await createUserAction(formData);
          console.log(data, "Return");
        }}
      >
        <input type="file" name="file" />
        <button>send</button>
      </form>
    </main>
  );
}
