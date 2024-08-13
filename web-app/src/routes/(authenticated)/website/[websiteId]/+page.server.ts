import type { Actions, PageServerLoad } from "./$types";

export const load: PageServerLoad = async ({ params, fetch, cookies, url }) => {
  const globalSettingsData = await fetch(`/api/settings?website_id=eq.${params.websiteId}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${cookies.get("session_token")}`,
      Accept: "application/vnd.pgrst.object+json"
    }
  });

  const headerData = await fetch(`/api/header?website_id=eq.${params.websiteId}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${cookies.get("session_token")}`,
      Accept: "application/vnd.pgrst.object+json"
    }
  });

  const footerData = await fetch(`/api/footer?website_id=eq.${params.websiteId}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${cookies.get("session_token")}`,
      Accept: "application/vnd.pgrst.object+json"
    }
  });

  const globalSettings = await globalSettingsData.json();
  const header = await headerData.json();
  const footer = await footerData.json();

  return {
    globalSettings,
    header,
    footer
  };
};

export const actions: Actions = {
  updateGlobal: async ({ request, fetch, cookies, params, locals }) => {
    const data = await request.formData();
    const faviconFile = data.get("favicon") as File;

    const uploadedImageData = await fetch(`/api/rpc/upload_file`, {
      method: "POST",
      headers: {
        "Content-Type": "application/octet-stream",
        Authorization: `Bearer ${cookies.get("session_token")}`,
        Accept: "application/vnd.pgrst.object+json",
        "X-Website-Id": params.websiteId,
        "X-Mimetype": faviconFile.type,
        "X-Original-Filename": faviconFile.name
      },
      body: await faviconFile.arrayBuffer()
    });

    const uploadedImage = await uploadedImageData.json();

    if (!uploadedImageData.ok && faviconFile.size > 0) {
      return { success: false, message: uploadedImage.message };
    }

    const res = await fetch(`/api/settings?website_id=eq.${params.websiteId}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${cookies.get("session_token")}`
      },
      body: JSON.stringify({
        accent_color_light_theme: data.get("accent-color-light"),
        accent_color_dark_theme: data.get("accent-color-dark"),
        favicon_image: uploadedImage.file_id
      })
    });

    if (!res.ok) {
      const response = await res.json();
      return { success: false, message: response.message };
    }

    return {
      success: true,
      message: "Successfully updated global settings"
    };
  },
  updateHeader: async ({ request, fetch, cookies, params }) => {
    const data = await request.formData();
    const logoImage = data.get("logo-image") as File;

    const uploadedImageData = await fetch(`/api/rpc/upload_file`, {
      method: "POST",
      headers: {
        "Content-Type": "application/octet-stream",
        Authorization: `Bearer ${cookies.get("session_token")}`,
        Accept: "application/vnd.pgrst.object+json",
        "X-Website-Id": params.websiteId,
        "X-Mimetype": logoImage.type,
        "X-Original-Filename": logoImage.name
      },
      body: await logoImage.arrayBuffer()
    });

    const uploadedImage = await uploadedImageData.json();

    if (!uploadedImageData.ok && logoImage.size > 0) {
      return { success: false, message: uploadedImage.message };
    }

    const res = await fetch(`/api/header?website_id=eq.${params.websiteId}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${cookies.get("session_token")}`
      },
      body: JSON.stringify({
        logo_type: data.get("logo-type"),
        logo_text: data.get("logo-text"),
        logo_image: uploadedImage.file_id
      })
    });

    if (!res.ok) {
      const response = await res.json();
      return { success: false, message: response.message };
    }

    return {
      success: true,
      message: "Successfully updated header"
    };
  },
  updateHome: async ({ request, fetch, cookies, params }) => {
    const data = await request.formData();

    const res = await fetch(`/api/home?website_id=eq.${params.websiteId}`, {
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

    return { success: true, message: "Successfully updated home" };
  },
  updateFooter: async ({ request, fetch, cookies, params }) => {
    const data = await request.formData();

    const res = await fetch(`/api/footer?website_id=eq.${params.websiteId}`, {
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
      message: "Successfully updated footer"
    };
  }
};
