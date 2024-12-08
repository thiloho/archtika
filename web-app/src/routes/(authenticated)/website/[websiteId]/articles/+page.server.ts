import type { Actions, PageServerLoad } from "./$types";
import { API_BASE_PREFIX } from "$lib/server/utils";
import { apiRequest } from "$lib/server/utils";
import { parse } from "node:path";
import type { Article, DocsCategory } from "$lib/db-schema";

export const load: PageServerLoad = async ({ params, fetch, url, parent, locals }) => {
  const searchQuery = url.searchParams.get("query");
  const filterBy = url.searchParams.get("filter");

  const { website, home, permissionLevel } = await parent();

  let baseFetchUrl = `${API_BASE_PREFIX}/article?website_id=eq.${params.websiteId}&select=id,user_id,title`;
  if (website.content_type === "Docs") {
    baseFetchUrl +=
      ",article_weight,docs_category(category_name,category_weight)&order=docs_category(category_weight).desc.nullslast,article_weight.desc.nullslast";
  }
  if (website.content_type === "Blog") {
    baseFetchUrl += "&order=last_modified_at.desc,created_at.desc";
  }

  const parameters = new URLSearchParams();

  if (searchQuery) {
    parameters.append("title", `wfts.${searchQuery}`);
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

  const totalArticles = await apiRequest(fetch, baseFetchUrl, "HEAD", {
    headers: {
      Prefer: "count=exact"
    },
    returnData: true
  });

  const totalArticleCount = Number(
    totalArticles.data.headers.get("content-range")?.split("/").at(-1)
  );

  const articles: (Article & { docs_category: DocsCategory | null })[] = (
    await apiRequest(fetch, constructedFetchUrl, "GET", {
      returnData: true
    })
  ).data;

  return {
    totalArticleCount,
    articles,
    website,
    home,
    permissionLevel,
    API_BASE_PREFIX,
    user: locals.user
  };
};

export const actions: Actions = {
  createArticle: async ({ request, fetch, params }) => {
    const data = await request.formData();

    return await apiRequest(fetch, `${API_BASE_PREFIX}/article`, "POST", {
      body: {
        website_id: params.websiteId,
        title: data.get("title")
      },
      successMessage: "Successfully created article"
    });
  },
  importArticles: async ({ request, fetch, params }) => {
    const data = await request.formData();
    const files = data.getAll("import-articles") as File[];

    const articles = await Promise.all(
      files.map(async (file) => {
        return {
          website_id: params.websiteId,
          title: parse(file.name).name,
          main_content: await file.text()
        };
      })
    );

    return await apiRequest(fetch, `${API_BASE_PREFIX}/article`, "POST", {
      body: articles,
      successMessage: "Successfully imported articles"
    });
  },
  deleteArticle: async ({ request, fetch }) => {
    const data = await request.formData();

    return await apiRequest(fetch, `${API_BASE_PREFIX}/article?id=eq.${data.get("id")}`, "DELETE", {
      successMessage: "Successfully deleted article"
    });
  }
};
