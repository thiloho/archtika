import type { Actions, PageServerLoad } from "./$types";
import { API_BASE_PREFIX, apiRequest } from "$lib/server/utils";
import type { Website, User } from "$lib/db-schema";
import { PAGINATION_MAX_ITEMS } from "$lib/utils";

export const load: PageServerLoad = async ({ fetch, url }) => {
  const currentPage = Number.parseInt(url.searchParams.get("page") ?? "1");
  const resultOffset = (currentPage - 1) * PAGINATION_MAX_ITEMS;

  const usersWithWebsites: (User & { website: Website[] })[] = (
    await apiRequest(
      fetch,
      `${API_BASE_PREFIX}/user?select=*,website!user_id(*)&order=created_at&limit=${PAGINATION_MAX_ITEMS}&offset=${resultOffset}`,
      "GET",
      {
        returnData: true
      }
    )
  ).data;

  const resultUsers = await apiRequest(fetch, `${API_BASE_PREFIX}/user`, "HEAD", {
    headers: {
      Prefer: "count=exact"
    },
    returnData: true
  });

  const resultUsersCount = Number(resultUsers.data.headers.get("content-range")?.split("/").at(-1));

  return {
    usersWithWebsites,
    API_BASE_PREFIX,
    resultUsersCount
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
