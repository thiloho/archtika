import { randomUUID } from "node:crypto";
import { mkdir, writeFile } from "node:fs/promises";
import { extname, join, relative } from "node:path";
import { ALLOWED_MIME_TYPES } from "$lib/utils.js";

export const load = async ({ params, fetch, cookies, url }) => {
  const globalSettingsData = await fetch(
    `http://localhost:3000/settings?website_id=eq.${params.websiteId}&select=*,media(*)`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${cookies.get("session_token")}`,
        Accept: "application/vnd.pgrst.object+json"
      }
    }
  );

  const headerData = await fetch(
    `http://localhost:3000/header?website_id=eq.${params.websiteId}&select=*,media(*)`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${cookies.get("session_token")}`,
        Accept: "application/vnd.pgrst.object+json"
      }
    }
  );

  const homeData = await fetch(`http://localhost:3000/home?website_id=eq.${params.websiteId}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${cookies.get("session_token")}`,
      Accept: "application/vnd.pgrst.object+json"
    }
  });

  const footerData = await fetch(`http://localhost:3000/footer?website_id=eq.${params.websiteId}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${cookies.get("session_token")}`,
      Accept: "application/vnd.pgrst.object+json"
    }
  });

  const searchQuery = url.searchParams.get("article_search_query");
  const sortBy = url.searchParams.get("article_sort");

  const parameters = new URLSearchParams();

  const baseFetchUrl = `http://localhost:3000/article?website_id=eq.${params.websiteId}&select=*,media(*)`;

  if (searchQuery) {
    parameters.append("title", `ilike.*${searchQuery}*`);
  }

  switch (sortBy) {
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

  const articlesData = await fetch(constructedFetchUrl, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${cookies.get("session_token")}`
    }
  });

  const globalSettings = await globalSettingsData.json();
  const header = await headerData.json();
  const home = await homeData.json();
  const footer = await footerData.json();
  const articles = await articlesData.json();

  return {
    globalSettings,
    header,
    home,
    footer,
    articles
  };
};

export const actions = {
  updateGlobal: async ({ request, fetch, cookies, params, locals }) => {
    const data = await request.formData();

    const faviconFile = data.get("favicon") as File;
    const favicon = await handleFileUpload(
      faviconFile,
      params.websiteId,
      locals.user.id,
      cookies.get("session_token"),
      fetch
    );

    if (favicon?.success === false) {
      return favicon;
    }

    const res = await fetch(`http://localhost:3000/settings?website_id=eq.${params.websiteId}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${cookies.get("session_token")}`
      },
      body: JSON.stringify({
        accent_color_light_theme: data.get("accent-color-light"),
        accent_color_dark_theme: data.get("accent-color-dark"),
        favicon_image: favicon?.content
      })
    });

    if (!res.ok) {
      const response = await res.json();
      return { success: false, message: response.message };
    }

    return {
      success: true,
      operation: "updated",
      ressource: "global settings"
    };
  },
  updateHeader: async ({ request, fetch, cookies, locals, params }) => {
    const data = await request.formData();

    const logoFile = data.get("logo-image") as File;
    const logo = await handleFileUpload(
      logoFile,
      params.websiteId,
      locals.user.id,
      cookies.get("session_token"),
      fetch
    );

    if (logo?.success === false) {
      return logo;
    }

    const res = await fetch(`http://localhost:3000/header?website_id=eq.${params.websiteId}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${cookies.get("session_token")}`
      },
      body: JSON.stringify({
        logo_type: data.get("logo-type"),
        logo_text: data.get("logo-text"),
        logo_image: logo?.content
      })
    });

    if (!res.ok) {
      const response = await res.json();
      return { success: false, message: response.message };
    }

    return {
      success: true,
      operation: "updated",
      ressource: "header settings"
    };
  },
  updateHome: async ({ request, fetch, cookies, params }) => {
    const data = await request.formData();

    const res = await fetch(`http://localhost:3000/home?website_id=eq.${params.websiteId}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${cookies.get("session_token")}`
      },
      body: JSON.stringify({
        main_content: data.get("main-content")
      })
    });

    if (!res.ok) {
      const response = await res.json();
      return { success: false, message: response.message };
    }

    return { success: true, operation: "updated", ressource: "home settings" };
  },
  updateFooter: async ({ request, fetch, cookies, params }) => {
    const data = await request.formData();

    const res = await fetch(`http://localhost:3000/footer?website_id=eq.${params.websiteId}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${cookies.get("session_token")}`
      },
      body: JSON.stringify({
        additional_text: data.get("additional-text")
      })
    });

    if (!res.ok) {
      const response = await res.json();
      return { success: false, message: response.message };
    }

    return {
      success: true,
      operation: "updated",
      ressource: "footer settings"
    };
  },
  createArticle: async ({ request, fetch, cookies, params }) => {
    const data = await request.formData();

    const res = await fetch("http://localhost:3000/article", {
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

    return { success: true, operation: "created", ressource: "article" };
  },
  editArticle: async ({ request, fetch, cookies, locals, params }) => {
    const data = await request.formData();

    const coverFile = data.get("cover-image") as File;
    const cover = await handleFileUpload(
      coverFile,
      params.websiteId,
      locals.user.id,
      cookies.get("session_token"),
      fetch
    );

    if (cover?.success === false) {
      return cover;
    }

    const res = await fetch(`http://localhost:3000/article?id=eq.${data.get("article-id")}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${cookies.get("session_token")}`
      },
      body: JSON.stringify({
        title: data.get("title"),
        meta_description: data.get("description"),
        meta_author: data.get("author"),
        cover_image: cover?.content,
        publication_date: data.get("publication-date"),
        main_content: data.get("main-content")
      })
    });

    if (!res.ok) {
      const response = await res.json();
      return { success: false, message: response.message };
    }

    return { success: true, operation: "updated", ressource: "article" };
  },
  deleteArticle: async ({ request, fetch, cookies }) => {
    const data = await request.formData();

    const res = await fetch(`http://localhost:3000/article?id=eq.${data.get("article-id")}`, {
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

    return { success: true, operation: "deleted", ressource: "article" };
  }
};

const handleFileUpload = async (
  file: File,
  contentId: string,
  userId: string,
  session_token: string | undefined,
  customFetch: typeof fetch
) => {
  if (file.size === 0) return undefined;

  const MAX_FILE_SIZE = 1024 * 1024;

  if (file.size > MAX_FILE_SIZE) {
    return {
      success: false,
      message: `File size exceeds the maximum limit of ${MAX_FILE_SIZE / 1024 / 1024} MB.`
    };
  }

  if (!ALLOWED_MIME_TYPES.includes(file.type)) {
    return {
      success: false,
      message: "Invalid file type. JPEG, PNG, SVG and WEBP are allowed."
    };
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  const uploadDir = join(process.cwd(), "static", "user-uploads", userId);
  await mkdir(uploadDir, { recursive: true });

  const fileId = randomUUID();
  const fileExtension = extname(file.name);
  const filepath = join(uploadDir, `${fileId}${fileExtension}`);

  await writeFile(filepath, buffer);

  const relativePath = relative(join(process.cwd(), "static"), filepath);

  const res = await customFetch("http://localhost:3000/media", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${session_token}`,
      Prefer: "return=representation",
      Accept: "application/vnd.pgrst.object+json"
    },
    body: JSON.stringify({
      website_id: contentId,
      user_id: userId,
      original_name: file.name,
      file_system_path: relativePath
    })
  });

  const response = await res.json();

  if (!res.ok) {
    return { success: false, message: response.message };
  }

  return { success: true, content: response.id };
};
