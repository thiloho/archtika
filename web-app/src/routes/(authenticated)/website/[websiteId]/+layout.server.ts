import type { LayoutServerLoad } from "./$types";
import { API_BASE_PREFIX } from "$lib/server/utils";
import { error } from "@sveltejs/kit";
import type { Website, Home, User } from "$lib/db-schema";

export const load: LayoutServerLoad = async ({ params, fetch, cookies }) => {
  const websiteData = await fetch(
    `${API_BASE_PREFIX}/website?id=eq.${params.websiteId}&select=*,user!user_id(username)`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${cookies.get("session_token")}`,
        Accept: "application/vnd.pgrst.object+json"
      }
    }
  );

  if (!websiteData.ok) {
    throw error(404, "Website not found");
  }

  const homeData = await fetch(`${API_BASE_PREFIX}/home?website_id=eq.${params.websiteId}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${cookies.get("session_token")}`,
      Accept: "application/vnd.pgrst.object+json"
    }
  });

  const website: Website & { user: { username: User["username"] } } = await websiteData.json();
  const home: Home = await homeData.json();

  return {
    website,
    home
  };
};
