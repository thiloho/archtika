import type { Actions, PageServerLoad } from "./$types";
import { API_BASE_PREFIX } from "$lib/server/utils";

export const load: PageServerLoad = async ({ parent, params, cookies, fetch }) => {
  const articleData = await fetch(`${API_BASE_PREFIX}/article?id=eq.${params.articleId}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${cookies.get("session_token")}`,
      Accept: "application/vnd.pgrst.object+json"
    }
  });

  const article = await articleData.json();
  const { website } = await parent();

  return { website, article, API_BASE_PREFIX };
};

export const actions: Actions = {
  editArticle: async ({ fetch, cookies, request, params }) => {
    const data = await request.formData();
    const coverFile = data.get("cover-image") as File;

    const uploadedImageData = await fetch(`${API_BASE_PREFIX}/rpc/upload_file`, {
      method: "POST",
      headers: {
        "Content-Type": "application/octet-stream",
        Authorization: `Bearer ${cookies.get("session_token")}`,
        Accept: "application/vnd.pgrst.object+json",
        "X-Website-Id": params.websiteId,
        "X-Mimetype": coverFile.type,
        "X-Original-Filename": coverFile.name
      },
      body: await coverFile.arrayBuffer()
    });

    const uploadedImage = await uploadedImageData.json();

    if (!uploadedImageData.ok && coverFile.size > 0) {
      return { success: false, message: uploadedImage.message };
    }

    const res = await fetch(`${API_BASE_PREFIX}/article?id=eq.${params.articleId}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${cookies.get("session_token")}`
      },
      body: JSON.stringify({
        title: data.get("title"),
        meta_description: data.get("description"),
        meta_author: data.get("author"),
        cover_image: uploadedImage.file_id,
        publication_date: data.get("publication-date"),
        main_content: data.get("main-content")
      })
    });

    if (!res.ok) {
      const response = await res.json();
      return { success: false, message: response.message };
    }

    return { success: true, message: "Successfully updated article" };
  },
  pasteImage: async ({ request, fetch, cookies, params }) => {
    const data = await request.formData();
    const file = data.get("file") as File;

    const fileData = await fetch(`${API_BASE_PREFIX}/rpc/upload_file`, {
      method: "POST",
      headers: {
        "Content-Type": "application/octet-stream",
        Authorization: `Bearer ${cookies.get("session_token")}`,
        Accept: "application/vnd.pgrst.object+json",
        "X-Website-Id": params.websiteId,
        "X-Mimetype": file.type,
        "X-Original-Filename": file.name
      },
      body: await file.arrayBuffer()
    });

    const fileJSON = await fileData.json();

    if (!fileData.ok) {
      return { success: false, message: fileJSON.message };
    }

    return { fileId: fileJSON.file_id };
  }
};
