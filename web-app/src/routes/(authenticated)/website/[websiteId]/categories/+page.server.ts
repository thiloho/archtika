import type { Actions, PageServerLoad } from "./$types";
import { API_BASE_PREFIX, apiRequest } from "$lib/server/utils";
import type { DocsCategory } from "$lib/db-schema";

export const load: PageServerLoad = async ({ parent, params, fetch, locals }) => {
  const categories: DocsCategory[] = (
    await apiRequest(
      fetch,
      `${API_BASE_PREFIX}/docs_category?website_id=eq.${params.websiteId}&order=category_weight.desc`,
      "GET",
      {
        returnData: true
      }
    )
  ).data;

  const { website, home, permissionLevel } = await parent();

  return {
    categories,
    website,
    home,
    permissionLevel,
    user: locals.user
  };
};

export const actions: Actions = {
  createCategory: async ({ request, fetch, params }) => {
    const data = await request.formData();

    return await apiRequest(fetch, `${API_BASE_PREFIX}/docs_category`, "POST", {
      body: {
        website_id: params.websiteId,
        category_name: data.get("category-name"),
        category_weight: data.get("category-weight")
      },
      successMessage: "Successfully created category"
    });
  },
  updateCategory: async ({ request, fetch }) => {
    const data = await request.formData();

    return await apiRequest(
      fetch,
      `${API_BASE_PREFIX}/docs_category?id=eq.${data.get("category-id")}`,
      "PATCH",
      {
        body: {
          category_name: data.get("category-name"),
          category_weight: data.get("category-weight")
        },
        successMessage: "Successfully updated category"
      }
    );
  },
  deleteCategory: async ({ request, fetch }) => {
    const data = await request.formData();

    return await apiRequest(
      fetch,
      `${API_BASE_PREFIX}/docs_category?id=eq.${data.get("category-id")}`,
      "DELETE",
      {
        successMessage: "Successfully deleted category"
      }
    );
  }
};
