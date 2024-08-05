import type { LayoutServerLoad } from "./$types";

export const load: LayoutServerLoad = async ({ params, fetch, cookies }) => {
  const websiteData = await fetch(`http://localhost:3000/website?id=eq.${params.websiteId}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${cookies.get("session_token")}`,
      Accept: "application/vnd.pgrst.object+json"
    }
  });

  const homeData = await fetch(`http://localhost:3000/home?website_id=eq.${params.websiteId}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${cookies.get("session_token")}`,
      Accept: "application/vnd.pgrst.object+json"
    }
  });

  const website = await websiteData.json();
  const home = await homeData.json();

  return {
    website,
    home
  };
};
