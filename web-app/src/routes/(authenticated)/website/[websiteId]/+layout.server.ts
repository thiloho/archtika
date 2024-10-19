import type { LayoutServerLoad } from "./$types";
import { API_BASE_PREFIX, apiRequest } from "$lib/server/utils";
import { error } from "@sveltejs/kit";
import type { Website, Home, User } from "$lib/db-schema";

export const load: LayoutServerLoad = async ({ locals, params, fetch }) => {
  const websiteData = await apiRequest(
    fetch,
    `${API_BASE_PREFIX}/website?id=eq.${params.websiteId}&select=*,user!user_id(username)`,
    "GET",
    {
      headers: {
        Accept: "application/vnd.pgrst.object+json"
      },
      returnData: true
    }
  );

  const website: Website & { user: { username: User["username"] } } = websiteData.data;

  if (!websiteData.success) {
    throw error(404, "Website not found");
  }

  const home: Home = (
    await apiRequest(fetch, `${API_BASE_PREFIX}/home?website_id=eq.${params.websiteId}`, "GET", {
      headers: {
        Accept: "application/vnd.pgrst.object+json"
      },
      returnData: true
    })
  ).data;

  let permissionLevel = 40;

  if (website.user_id !== locals.user.id) {
    permissionLevel = (
      await apiRequest(
        fetch,
        `${API_BASE_PREFIX}/collab?select=permission_level&website_id=eq.${params.websiteId}&user_id=eq.${locals.user.id}`,
        "GET",
        {
          headers: {
            Accept: "application/vnd.pgrst.object+json"
          },
          returnData: true
        }
      )
    ).data.permission_level;
  }

  return {
    website,
    home,
    permissionLevel
  };
};
