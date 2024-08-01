import { handleFileUpload } from "$lib/server/utils.js";

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

  const footerData = await fetch(`http://localhost:3000/footer?website_id=eq.${params.websiteId}`, {
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
      message: "Successfully updated global settings"
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
      message: "Successfully updated header"
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

    return { success: true, message: "Successfully updated home" };
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
      message: "Successfully updated footer"
    };
  }
};
