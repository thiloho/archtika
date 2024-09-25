import type { Actions } from "./$types";
import { API_BASE_PREFIX, apiRequest } from "$lib/server/utils";

export const actions: Actions = {
  default: async ({ request, cookies, fetch }) => {
    const data = await request.formData();

    const response = await apiRequest(fetch, `${API_BASE_PREFIX}/rpc/login`, "POST", {
      body: {
        username: data.get("username"),
        pass: data.get("password")
      },
      returnData: true,
      successMessage: "Successfully logged in, you can refresh the page"
    });

    if (!response.success) {
      return response;
    }

    cookies.set("session_token", response.data.token, { path: "/" });
    return response;
  }
};
