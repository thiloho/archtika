import type { Actions } from "./$types";
import { API_BASE_PREFIX } from "$lib/server/utils";

export const actions: Actions = {
  default: async ({ request, cookies, fetch }) => {
    const data = await request.formData();

    const res = await fetch(`${API_BASE_PREFIX}/rpc/login`, {
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
