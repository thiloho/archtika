import type { Actions, PageServerLoad } from "./$types";
import { API_BASE_PREFIX } from "$lib/server/utils";

export const load: PageServerLoad = async ({ params, fetch, cookies, url, parent, locals }) => {
  const searchQuery = url.searchParams.get("article_search_query");
  const filterBy = url.searchParams.get("article_filter");

  const { website, home } = await parent();

  let baseFetchUrl = `${API_BASE_PREFIX}/article?website_id=eq.${params.websiteId}&select=id,title`;
  if (website.content_type === "Docs") {
    baseFetchUrl +=
      ",article_weight,docs_category(category_name,category_weight)&order=docs_category(category_weight).desc.nullslast,article_weight.desc.nullslast";
  }
  if (website.content_type === "Blog") {
    baseFetchUrl += "&order=last_modified_at.desc,created_at.desc";
  }

  console.log(baseFetchUrl);

  const parameters = new URLSearchParams();

  if (searchQuery) {
    parameters.append("title_description_search", `wfts(english).${searchQuery}`);
  }

  switch (filterBy) {
    case "creations":
      parameters.append("user_id", `eq.${locals.user.id}`);
      break;
    case "shared":
      parameters.append("user_id", `not.eq.${locals.user.id}`);
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

  return {
    totalArticleCount,
    articles,
    website,
    home
  };
};

export const actions: Actions = {
  createArticle: async ({ request, fetch, cookies, params }) => {
    const data = await request.formData();

    const res = await fetch(`${API_BASE_PREFIX}/article`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${cookies.get("session_token")}`
      },
      body: JSON.stringify({
        website_id: params.websiteId,
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
