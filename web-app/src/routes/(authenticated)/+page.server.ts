export const load = async ({ fetch, cookies, url }) => {
  const searchQuery = url.searchParams.get("website_search_query");
  const sortBy = url.searchParams.get("website_sort");

  const params = new URLSearchParams();

  const baseFetchUrl = "http://localhost:3000/website";

  if (searchQuery) {
    params.append("website_title", `ilike.*${searchQuery}*`);
  }

  switch (sortBy) {
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

  const websiteData = await fetch(constructedFetchUrl, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${cookies.get("session_token")}`
    }
  });

  const websites = await websiteData.json();

  return {
    websites
  };
};

export const actions = {
  createWebsite: async ({ request, fetch, cookies }) => {
    const data = await request.formData();

    const res = await fetch("http://localhost:3000/rpc/create_website", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${cookies.get("session_token")}`
      },
      body: JSON.stringify({
        content_type: data.get("content-type"),
        title: data.get("title")
      })
    });

    if (!res.ok) {
      const response = await res.json();
      return { createWebsite: { success: false, message: response.message } };
    }

    return { createWebsite: { success: true, operation: "created" } };
  },
  updateWebsite: async ({ request, cookies, fetch }) => {
    const data = await request.formData();

    const res = await fetch(`http://localhost:3000/website?id=eq.${data.get("id")}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${cookies.get("session_token")}`
      },
      body: JSON.stringify({
        title: data.get("title")
      })
    });

    if (!res.ok) {
      const response = await res.json();
      return { updateWebsite: { success: false, message: response.message } };
    }

    return { updateWebsite: { success: true, operation: "updated" } };
  },
  deleteWebsite: async ({ request, cookies, fetch }) => {
    const data = await request.formData();

    const res = await fetch(`http://localhost:3000/website?id=eq.${data.get("id")}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${cookies.get("session_token")}`
      }
    });

    if (!res.ok) {
      const response = await res.json();
      return { deleteWebsite: { success: false, message: response.message } };
    }

    return { deleteWebsite: { success: true, operation: "deleted" } };
  }
};
