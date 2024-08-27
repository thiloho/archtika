import type { Actions, PageServerLoad } from "./$types";
import { API_BASE_PREFIX } from "$lib/server/utils";

export const load: PageServerLoad = async ({ parent, params, cookies, fetch }) => {
  const categoryData = await fetch(
    `${API_BASE_PREFIX}/docs_category?website_id=eq.${params.websiteId}&order=category_weight.desc`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${cookies.get("session_token")}`
      }
    }
  );

  const categories = await categoryData.json();
  const { website, home } = await parent();

  return {
    categories,
    website,
    home
  };
};

export const actions: Actions = {
  createCategory: async ({ request, fetch, cookies, params }) => {
    const data = await request.formData();

    const res = await fetch(`${API_BASE_PREFIX}/docs_category`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${cookies.get("session_token")}`
      },
      body: JSON.stringify({
        website_id: params.websiteId,
        category_name: data.get("category-name"),
        category_weight: data.get("category-weight")
      })
    });

    if (!res.ok) {
      const response = await res.json();
      return { success: false, message: response.message };
    }

    return { success: true, message: "Successfully created category" };
  },
  updateCategory: async ({ request, fetch, cookies, params }) => {
    const data = await request.formData();

    const res = await fetch(
      `${API_BASE_PREFIX}/docs_category?website_id=eq.${params.websiteId}&id=eq.${data.get("category-id")}`,
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${cookies.get("session_token")}`
        },
        body: JSON.stringify({
          category_weight: data.get("category-weight")
        })
      }
    );

    if (!res.ok) {
      const response = await res.json();
      return { success: false, message: response.message };
    }

    return { success: true, message: "Successfully updated category" };
  },
  deleteCategory: async ({ request, fetch, cookies, params }) => {
    const data = await request.formData();

    const res = await fetch(
      `${API_BASE_PREFIX}/docs_category?website_id=eq.${params.websiteId}&id=eq.${data.get("category-id")}`,
      {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${cookies.get("session_token")}`
        }
      }
    );

    if (!res.ok) {
      const response = await res.json();
      return { success: false, message: response.message };
    }

    return { success: true, message: "Successfully deleted category" };
  }
};
