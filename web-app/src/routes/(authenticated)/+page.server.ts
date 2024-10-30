import type { Actions, PageServerLoad } from "./$types";
import { apiRequest } from "$lib/server/utils";
import { API_BASE_PREFIX } from "$lib/server/utils";
import type { Collab, Website } from "$lib/db-schema";

export const load: PageServerLoad = async ({ fetch, url, locals }) => {
  const searchQuery = url.searchParams.get("query");
  const filterBy = url.searchParams.get("filter");

  const params = new URLSearchParams();

  const baseFetchUrl = `${API_BASE_PREFIX}/website?select=*,collab(user_id,permission_level)&collab.user_id=eq.${locals.user.id}&or=(user_id.eq.${locals.user.id},collab.not.is.null)&order=last_modified_at.desc,created_at.desc`;

  if (searchQuery) {
    params.append("title", `wfts.${searchQuery}`);
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

  const totalWebsites = await apiRequest(fetch, baseFetchUrl, "HEAD", {
    headers: {
      Prefer: "count=exact"
    },
    returnData: true
  });

  const totalWebsiteCount = Number(
    totalWebsites.data.headers.get("content-range")?.split("/").at(-1)
  );

  const websites: (Website & { collab: Collab[] })[] = (
    await apiRequest(fetch, constructedFetchUrl, "GET", {
      returnData: true
    })
  ).data;

  return {
    totalWebsiteCount,
    websites,
    user: locals.user
  };
};

export const actions: Actions = {
  createWebsite: async ({ request, fetch }) => {
    const data = await request.formData();

    return await apiRequest(fetch, `${API_BASE_PREFIX}/rpc/create_website`, "POST", {
      body: {
        content_type: data.get("content-type"),
        title: data.get("title")
      },
      successMessage: "Successfully created website"
    });
  },
  updateWebsite: async ({ request, fetch }) => {
    const data = await request.formData();

    return await apiRequest(fetch, `${API_BASE_PREFIX}/website?id=eq.${data.get("id")}`, "PATCH", {
      body: {
        title: data.get("title")
      },
      successMessage: "Successfully updated website"
    });
  },
  deleteWebsite: async ({ request, fetch }) => {
    const data = await request.formData();
    const id = data.get("id");

    return await apiRequest(fetch, `${API_BASE_PREFIX}/website?id=eq.${id}`, "DELETE", {
      successMessage: "Successfully deleted website"
    });
  }
};
