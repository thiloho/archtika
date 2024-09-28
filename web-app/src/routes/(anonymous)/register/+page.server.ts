import type { Actions, PageServerLoad } from "./$types";
import { API_BASE_PREFIX, REGISTRATION_IS_DISABLED, apiRequest } from "$lib/server/utils";

export const load: PageServerLoad = async () => {
  return {
    REGISTRATION_IS_DISABLED
  };
};

export const actions: Actions = {
  default: async ({ request, fetch }) => {
    const data = await request.formData();

    return await apiRequest(fetch, `${API_BASE_PREFIX}/rpc/register`, "POST", {
      body: {
        username: data.get("username"),
        pass: data.get("password")
      },
      successMessage: "Successfully registered, you can now login"
    });
  }
};
