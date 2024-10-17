import type { Actions, PageServerLoad } from "./$types";
import { API_BASE_PREFIX } from "$lib/server/utils";
import { apiRequest } from "$lib/server/utils";
import type { Settings, Header, Footer } from "$lib/db-schema";

export const load: PageServerLoad = async ({ params, fetch }) => {
  const [globalSettingsResponse, headerResponse, footerResponse] = await Promise.all([
    apiRequest(fetch, `${API_BASE_PREFIX}/settings?website_id=eq.${params.websiteId}`, "GET", {
      headers: { Accept: "application/vnd.pgrst.object+json" },
      returnData: true
    }),
    apiRequest(fetch, `${API_BASE_PREFIX}/header?website_id=eq.${params.websiteId}`, "GET", {
      headers: { Accept: "application/vnd.pgrst.object+json" },
      returnData: true
    }),
    apiRequest(fetch, `${API_BASE_PREFIX}/footer?website_id=eq.${params.websiteId}`, "GET", {
      headers: { Accept: "application/vnd.pgrst.object+json" },
      returnData: true
    })
  ]);

  const globalSettings: Settings = globalSettingsResponse.data;
  const header: Header = headerResponse.data;
  const footer: Footer = footerResponse.data;

  return {
    globalSettings,
    header,
    footer,
    API_BASE_PREFIX
  };
};

export const actions: Actions = {
  updateGlobal: async ({ request, fetch, params }) => {
    const data = await request.formData();
    const faviconFile = data.get("favicon") as File;

    const headers: Record<string, string> = {
      "Content-Type": "application/octet-stream",
      Accept: "application/vnd.pgrst.object+json",
      "X-Website-Id": params.websiteId
    };

    if (faviconFile) {
      headers["X-Mimetype"] = faviconFile.type;
      headers["X-Original-Filename"] = faviconFile.name;
    }

    const uploadedImage = await apiRequest(fetch, `${API_BASE_PREFIX}/rpc/upload_file`, "POST", {
      headers,
      body: faviconFile ? await faviconFile.arrayBuffer() : null,
      returnData: true
    });

    if (!uploadedImage.success && (faviconFile?.size ?? 0 > 0)) {
      return uploadedImage;
    }

    return await apiRequest(
      fetch,
      `${API_BASE_PREFIX}/settings?website_id=eq.${params.websiteId}`,
      "PATCH",
      {
        body: {
          accent_color_dark_theme: data.get("accent-color-dark"),
          accent_color_light_theme: data.get("accent-color-light"),
          background_color_dark_theme: data.get("background-color-dark"),
          background_color_light_theme: data.get("background-color-light"),
          favicon_image: uploadedImage.data?.file_id
        },
        successMessage: "Successfully updated global settings"
      }
    );
  },
  updateHeader: async ({ request, fetch, params }) => {
    const data = await request.formData();
    const logoImage = data.get("logo-image") as File;

    const headers: Record<string, string> = {
      "Content-Type": "application/octet-stream",
      Accept: "application/vnd.pgrst.object+json",
      "X-Website-Id": params.websiteId
    };

    if (logoImage) {
      headers["X-Mimetype"] = logoImage.type;
      headers["X-Original-Filename"] = logoImage.name;
    }

    const uploadedImage = await apiRequest(fetch, `${API_BASE_PREFIX}/rpc/upload_file`, "POST", {
      headers,
      body: logoImage ? await logoImage.arrayBuffer() : null,
      returnData: true
    });

    if (!uploadedImage.success && (logoImage?.size ?? 0 > 0)) {
      return { success: false, message: uploadedImage.message };
    }

    return await apiRequest(
      fetch,
      `${API_BASE_PREFIX}/header?website_id=eq.${params.websiteId}`,
      "PATCH",
      {
        body: {
          logo_type: data.get("logo-type"),
          logo_text: data.get("logo-text"),
          logo_image: uploadedImage.data?.file_id
        },
        successMessage: "Successfully updated header"
      }
    );
  },
  updateHome: async ({ request, fetch, params }) => {
    const data = await request.formData();

    return await apiRequest(
      fetch,
      `${API_BASE_PREFIX}/home?website_id=eq.${params.websiteId}`,
      "PATCH",
      {
        body: {
          main_content: data.get("main-content"),
          meta_description: data.get("description")
        },
        successMessage: "Successfully updated home"
      }
    );
  },
  updateFooter: async ({ request, fetch, params }) => {
    const data = await request.formData();

    return await apiRequest(
      fetch,
      `${API_BASE_PREFIX}/footer?website_id=eq.${params.websiteId}`,
      "PATCH",
      {
        body: {
          additional_text: data.get("additional-text")
        },
        successMessage: "Successfully updated footer"
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
        "X-Mimetype": file.type,
        "X-Original-Filename": file.name
      },
      body: await file.arrayBuffer(),
      successMessage: "Successfully uploaded image",
      returnData: true
    });
  }
};
