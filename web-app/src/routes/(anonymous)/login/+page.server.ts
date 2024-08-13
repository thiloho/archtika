import type { Actions } from "./$types";

export const actions: Actions = {
  default: async ({ request, cookies, fetch }) => {
    const data = await request.formData();

    const res = await fetch(`/api/rpc/login`, {
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

    cookies.set("session_token", response.token, { path: "/" });
    return { success: true, message: "Successfully logged in" };
  }
};
