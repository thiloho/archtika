import type { Actions, PageServerLoad } from "./$types";
import { API_BASE_PREFIX } from "$lib/server/utils";
import { rm } from "node:fs/promises";
import { join } from "node:path";
import type { Website, WebsiteInput } from "$lib/db-schema";

export const load: PageServerLoad = async ({ fetch, cookies, url, locals }) => {
  const searchQuery = url.searchParams.get("website_search_query");
  const filterBy = url.searchParams.get("website_filter");

  const params = new URLSearchParams();

  const baseFetchUrl = `${API_BASE_PREFIX}/website?order=last_modified_at.desc,created_at.desc`;

  if (searchQuery) {
    params.append("title_search", `wfts(english).${searchQuery}`);
  }

  switch (filterBy) {
    case "creations":
      params.append("user_id", `eq.${locals.user.id}`);
      break;
    case "shared":
      params.append("user_id", `not.eq.${locals.user.id}`);
      break;
  }

  const constructedFetchUrl = `${baseFetchUrl}&${params.toString()}`;

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

  const websites: Website[] = await websiteData.json();

  return {
    totalWebsiteCount,
    websites
  };
};

export const actions: Actions = {
  createWebsite: async ({ request, fetch, cookies }) => {
    const data = await request.formData();

    const res = await fetch(`${API_BASE_PREFIX}/rpc/create_website`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${cookies.get("session_token")}`
      },
      body: JSON.stringify({
        content_type: data.get("content-type") as string,
        title: data.get("title") as string
      } satisfies WebsiteInput)
    });

    if (!res.ok) {
      const response = await res.json();
      return { success: false, message: response.message };
    }

    return { success: true, message: "Successfully created website" };
  },
  updateWebsite: async ({ request, cookies, fetch }) => {
    const data = await request.formData();

    const res = await fetch(`${API_BASE_PREFIX}/website?id=eq.${data.get("id")}`, {
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
      return { success: false, message: response.message };
    }

    return { success: true, message: "Successfully updated website" };
  },
  deleteWebsite: async ({ request, cookies, fetch }) => {
    const data = await request.formData();

    const oldDomainPrefixData = await fetch(
      `${API_BASE_PREFIX}/domain_prefix?website_id=eq.${data.get("id")}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${cookies.get("session_token")}`,
          Accept: "application/vnd.pgrst.object+json"
        }
      }
    );
    const oldDomainPrefix = await oldDomainPrefixData.json();

    const res = await fetch(`${API_BASE_PREFIX}/website?id=eq.${data.get("id")}`, {
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

    await rm(join("/", "var", "www", "archtika-websites", "previews", data.get("id") as string), {
      recursive: true,
      force: true
    });

    await rm(
      join("/", "var", "www", "archtika-websites", oldDomainPrefix.prefix ?? data.get("id")),
      {
        recursive: true,
        force: true
      }
    );

    return { success: true, message: "Successfully deleted website" };
  }
};
