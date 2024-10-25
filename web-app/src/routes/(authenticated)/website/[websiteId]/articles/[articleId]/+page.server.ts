import type { Actions, PageServerLoad } from "./$types";
import { API_BASE_PREFIX, apiRequest } from "$lib/server/utils";
import type { Article, DocsCategory } from "$lib/db-schema";

export const load: PageServerLoad = async ({ parent, params, fetch }) => {
  const article: Article = (
    await apiRequest(fetch, `${API_BASE_PREFIX}/article?id=eq.${params.articleId}`, "GET", {
      headers: {
        Accept: "application/vnd.pgrst.object+json"
      },
      returnData: true
    })
  ).data;

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

  const { website, permissionLevel } = await parent();

  return { website, article, categories, API_BASE_PREFIX, permissionLevel };
};

export const actions: Actions = {
  editArticle: async ({ fetch, request, params }) => {
    const data = await request.formData();
    const coverFile = data.get("cover-image") as File;

    const headers: Record<string, string> = {
      "Content-Type": "application/octet-stream",
      Accept: "application/vnd.pgrst.object+json",
      "X-Website-Id": params.websiteId
    };

    if (coverFile) {
      headers["X-Original-Filename"] = coverFile.name;
    }

    const uploadedImage = await apiRequest(fetch, `${API_BASE_PREFIX}/rpc/upload_file`, "POST", {
      headers,
      body: coverFile ? await coverFile.arrayBuffer() : null,
      returnData: true
    });

    if (!uploadedImage.success && (coverFile?.size ?? 0 > 0)) {
      return { success: false, message: uploadedImage.message };
    }

    return await apiRequest(
      fetch,
      `${API_BASE_PREFIX}/article?id=eq.${params.articleId}`,
      "PATCH",
      {
        body: {
          title: data.get("title"),
          meta_description: data.get("description"),
          meta_author: data.get("author"),
          cover_image: uploadedImage.data?.file_id,
          publication_date: data.get("publication-date"),
          main_content: data.get("main-content"),
          category: data.get("category"),
          article_weight: data.get("article-weight") ? data.get("article-weight") : null
        },
        successMessage: "Successfully updated article"
      }
    );
  },
  pasteImage: async ({ request, fetch, params }) => {
    const data = await request.formData();
    const file = data.get("file") as File;

    return await apiRequest(fetch, `${API_BASE_PREFIX}/rpc/upload_file`, "POST", {
      headers: {
        "Content-Type": "application/octet-stream",
        Accept: "application/vnd.pgrst.object+json",
        "X-Website-Id": params.websiteId,
        "X-Original-Filename": file.name
      },
      body: await file.arrayBuffer(),
      successMessage: "Successfully uploaded image",
      returnData: true
    });
  }
};
