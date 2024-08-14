import type { Actions, PageServerLoad } from "./$types";
import { API_BASE_PREFIX } from "$lib/utils";

export const load: PageServerLoad = async ({ params, fetch, cookies, url, parent }) => {
  const searchQuery = url.searchParams.get("article_search_query");
  const sortBy = url.searchParams.get("article_sort");

  const parameters = new URLSearchParams();

  const baseFetchUrl = `${API_BASE_PREFIX}/article?website_id=eq.${params.websiteId}&select=id,title`;

  if (searchQuery) {
    parameters.append("title", `ilike.*${searchQuery}*`);
  }

  switch (sortBy) {
    case null:
    case "creation-time":
      parameters.append("order", "created_at.desc");
      break;
    case "last-modified":
      parameters.append("order", "last_modified_at.desc");
      break;
    case "title-a-to-z":
      parameters.append("order", "title.asc");
      break;
    case "title-z-to-a":
      parameters.append("order", "title.desc");
      break;
  }

  const constructedFetchUrl = `${baseFetchUrl}&${parameters.toString()}`;

  const totalArticlesData = await fetch(baseFetchUrl, {
    method: "HEAD",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${cookies.get("session_token")}`,
      Prefer: "count=exact"
    }
  });

  const totalArticleCount = Number(
    totalArticlesData.headers.get("content-range")?.split("/").at(-1)
  );

  const articlesData = await fetch(constructedFetchUrl, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${cookies.get("session_token")}`
    }
  });

  const articles = await articlesData.json();
  const { website, home } = await parent();

  return {
    totalArticleCount,
    articles,
    website,
    home
  };
};

export const actions: Actions = {
  createArticle: async ({ request, fetch, cookies, params, locals }) => {
    const data = await request.formData();

    const res = await fetch(`${API_BASE_PREFIX}/article`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${cookies.get("session_token")}`
      },
      body: JSON.stringify({
        website_id: params.websiteId,
        user_id: locals.user.id,
        title: data.get("title")
      })
    });

    if (!res.ok) {
      const response = await res.json();
      return { success: false, message: response.message };
    }

    return { success: true, message: "Successfully created article" };
  },
  deleteArticle: async ({ request, fetch, cookies }) => {
    const data = await request.formData();

    const res = await fetch(`${API_BASE_PREFIX}/article?id=eq.${data.get("id")}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${cookies.get("session_token")}`
      }
    });

    if (!res.ok) {
      const response = await res.json();
      return { success: false, message: response.message };
    }

    return { success: true, message: "Successfully deleted article" };
  }
};
