import type { Actions } from "./$types";

export const actions: Actions = {
  default: async ({ request, fetch }) => {
    const data = await request.formData();

    const res = await fetch("http://localhost:3000/rpc/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        username: data.get("username"),
        password: data.get("password")
      })
    });

    const response = await res.json();

    if (!res.ok) {
      return { success: false, message: response.message };
    }

    return { success: true, message: "Successfully registered, you can now login" };
  }
};
