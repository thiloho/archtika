import type { Actions, PageServerLoad } from "./$types";
import { API_BASE_PREFIX } from "$lib/server/utils";

export const load: PageServerLoad = async ({ locals }) => {
  return {
    user: locals.user
  };
};

export const actions: Actions = {
  logout: async ({ cookies }) => {
    cookies.delete("session_token", { path: "/" });

    return { success: true, message: "Successfully logged out" };
  },
  deleteAccount: async ({ request, fetch, cookies }) => {
    const data = await request.formData();

    const res = await fetch(`${API_BASE_PREFIX}/rpc/delete_account`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${cookies.get("session_token")}`
      },
      body: JSON.stringify({
        pass: data.get("password")
      })
    });

    const response = await res.json();

    if (!res.ok) {
      return { success: false, message: response.message };
    }

    cookies.delete("session_token", { path: "/" });
    return { success: true, message: "Successfully deleted account" };
  }
};
