import type { Actions, PageServerLoad } from "./$types";
import { API_BASE_PREFIX } from "$lib/server/utils";
import { apiRequest } from "$lib/server/utils";
import type { Website, User } from "$lib/db-schema";

export const load: PageServerLoad = async ({ fetch }) => {
  const usersWithWebsites: (User & { website: Website[] })[] = (
    await apiRequest(
      fetch,
      `${API_BASE_PREFIX}/user?select=*,website!user_id(*)&order=created_at`,
      "GET",
      {
        returnData: true
      }
    )
  ).data;

  return {
    usersWithWebsites,
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
