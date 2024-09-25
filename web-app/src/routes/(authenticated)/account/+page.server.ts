import type { Actions, PageServerLoad } from "./$types";
import { API_BASE_PREFIX, apiRequest } from "$lib/server/utils";

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

    const response = await apiRequest(fetch, `${API_BASE_PREFIX}/rpc/delete_account`, "POST", {
      body: {
        pass: data.get("password")
      },
      successMessage: "Successfully deleted account"
    });

    if (!response.success) {
      return response;
    }

    cookies.delete("session_token", { path: "/" });
    return response;
  }
};
