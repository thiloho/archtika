import type { Actions, PageServerLoad } from "./$types";
import { API_BASE_PREFIX, apiRequest } from "$lib/server/utils";

export const load: PageServerLoad = async ({ fetch, locals }) => {
  const storageSizes = await apiRequest(
    fetch,
    `${API_BASE_PREFIX}/rpc/user_websites_storage_size`,
    "GET",
    {
      returnData: true
    }
  );

  return {
    user: locals.user,
    storageSizes
  };
};

export const actions: Actions = {
  logout: async ({ cookies }) => {
    cookies.delete("session_token", { path: "/" });

    return { success: true, message: "Successfully logged out, you can refresh the page" };
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
