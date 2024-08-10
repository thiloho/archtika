import type { Actions, PageServerLoad } from "./$types";

export const load: PageServerLoad = async ({ parent, params, cookies, fetch }) => {
  const articleData = await fetch(`http://localhost:3000/article?id=eq.${params.articleId}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${cookies.get("session_token")}`,
      Accept: "application/vnd.pgrst.object+json"
    }
  });

  const article = await articleData.json();
  const { website } = await parent();

  return { website, article };
};

export const actions: Actions = {
  default: async ({ fetch, cookies, request, params, locals }) => {
    const data = await request.formData();
    const coverFile = data.get("cover-image") as File;

    const uploadedImageData = await fetch(`http://localhost:3000/rpc/upload_file`, {
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

    if (!uploadedImageData.ok) {
      return { success: false, message: uploadedImage.message };
    }

    const res = await fetch(`http://localhost:3000/article?id=eq.${params.articleId}`, {
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
  }
};
