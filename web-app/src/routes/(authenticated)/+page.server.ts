import type { Actions, PageServerLoad } from "./$types";

export const load: PageServerLoad = async ({ fetch, cookies, url }) => {
  const searchQuery = url.searchParams.get("website_search_query");
  const sortBy = url.searchParams.get("website_sort");

  const params = new URLSearchParams();

  const baseFetchUrl = `http://localhost:${process.env.ARCHTIKA_API_PORT}/website`;

  if (searchQuery) {
    params.append("title", `ilike.*${searchQuery}*`);
  }

  switch (sortBy) {
    case null:
    case "creation-time":
      params.append("order", "created_at.desc");
      break;
    case "last-modified":
      params.append("order", "last_modified_at.desc");
      break;
    case "title-a-to-z":
      params.append("order", "title.asc");
      break;
    case "title-z-to-a":
      params.append("order", "title.desc");
      break;
  }

  const constructedFetchUrl = `${baseFetchUrl}?${params.toString()}`;

  const totalWebsitesData = await fetch(baseFetchUrl, {
    method: "HEAD",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${cookies.get("session_token")}`,
      Prefer: "count=exact"
    }
  });

  const totalWebsiteCount = Number(
    totalWebsitesData.headers.get("content-range")?.split("/").at(-1)
  );

  const websiteData = await fetch(constructedFetchUrl, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${cookies.get("session_token")}`
    }
  });

  const websites = await websiteData.json();

  return {
    totalWebsiteCount,
    websites
  };
};

export const actions: Actions = {
  createWebsite: async ({ request, fetch, cookies }) => {
    const data = await request.formData();

    const res = await fetch(
      `http://localhost:${process.env.ARCHTIKA_API_PORT}/rpc/create_website`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${cookies.get("session_token")}`
        },
        body: JSON.stringify({
          content_type: data.get("content-type"),
          title: data.get("title")
        })
      }
    );

    if (!res.ok) {
      const response = await res.json();
      return { success: false, message: response.message };
    }

    return { success: true, message: "Successfully created website" };
  },
  updateWebsite: async ({ request, cookies, fetch }) => {
    const data = await request.formData();

    const res = await fetch(
      `http://localhost:${process.env.ARCHTIKA_API_PORT}/website?id=eq.${data.get("id")}`,
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${cookies.get("session_token")}`
        },
        body: JSON.stringify({
          title: data.get("title")
        })
      }
    );

    if (!res.ok) {
      const response = await res.json();
      return { success: false, message: response.message };
    }

    return { success: true, message: "Successfully updated website" };
  },
  deleteWebsite: async ({ request, cookies, fetch }) => {
    const data = await request.formData();

    const res = await fetch(
      `http://localhost:${process.env.ARCHTIKA_API_PORT}/website?id=eq.${data.get("id")}`,
      {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${cookies.get("session_token")}`
        }
      }
    );

    if (!res.ok) {
      const response = await res.json();
      return { success: false, message: response.message };
    }

    return { success: true, message: "Successfully deleted website" };
  }
};
