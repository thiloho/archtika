import type { Actions, PageServerLoad } from "./$types";
import { API_BASE_PREFIX } from "$lib/server/utils";
import { apiRequest } from "$lib/server/utils";

export const load: PageServerLoad = async ({ fetch }) => {
  const allUsers = (
    await apiRequest(
      fetch,
      `${API_BASE_PREFIX}/all_user_websites?order=user_created_at.desc`,
      "GET",
      {
        returnData: true
      }
    )
  ).data;

  return {
    allUsers,
    API_BASE_PREFIX
  };
};

export const actions: Actions = {
  updateMaxWebsiteAmount: async ({ request, fetch }) => {
    const data = await request.formData();

    return await apiRequest(
      fetch,
      `${API_BASE_PREFIX}/user?id=eq.${data.get("user-id")}`,
      "PATCH",
      {
        body: {
          max_number_websites: data.get("number-of-websites")
        },
        successMessage: "Successfully updated user website limit"
      }
    );
  },
  updateStorageLimit: async ({ request, fetch }) => {
    const data = await request.formData();

    console.log(`${API_BASE_PREFIX}/website?id=eq.${data.get("website-id")}`);

    return await apiRequest(
      fetch,
      `${API_BASE_PREFIX}/website?id=eq.${data.get("website-id")}`,
      "PATCH",
      {
        body: {
          max_storage_size: data.get("storage-size")
        },
        successMessage: "Successfully updated user website storage size"
      }
    );
  },
  deleteUser: async ({ request, fetch }) => {
    const data = await request.formData();

    return await apiRequest(
      fetch,
      `${API_BASE_PREFIX}/user?id=eq.${data.get("user-id")}`,
      "DELETE",
      {
        successMessage: "Successfully deleted user"
      }
    );
  }
};
