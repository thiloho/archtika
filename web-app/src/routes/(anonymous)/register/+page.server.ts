import type { Actions, PageServerLoad } from "./$types";
import { API_BASE_PREFIX, REGISTRATION_IS_DISABLED } from "$lib/server/utils";

export const load: PageServerLoad = async () => {
  return {
    REGISTRATION_IS_DISABLED
  };
};

export const actions: Actions = {
  default: async ({ request, fetch }) => {
    const data = await request.formData();

    const res = await fetch(`${API_BASE_PREFIX}/rpc/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        username: data.get("username"),
        pass: data.get("password")
      })
    });

    const response = await res.json();

    if (!res.ok) {
      return { success: false, message: response.message };
    }

    return { success: true, message: "Successfully registered, you can now login" };
  }
};
