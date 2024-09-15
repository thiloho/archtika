import type { PageServerLoad } from "./$types";
import { API_BASE_PREFIX } from "$lib/server/utils";
import type { ChangeLog, User, Collab } from "$lib/db-schema";

export const load: PageServerLoad = async ({ parent, fetch, params, cookies, url }) => {
  const userFilter = url.searchParams.get("logs_filter_user");
  const resourceFilter = url.searchParams.get("logs_filter_resource");
  const operationFilter = url.searchParams.get("logs_filter_operation");
  const currentPage = Number.parseInt(url.searchParams.get("logs_results_page") ?? "1");
  const resultOffset = currentPage === 1 ? 0 : currentPage * 50;

  const searchParams = new URLSearchParams();

  const baseFetchUrl = `${API_BASE_PREFIX}/change_log?website_id=eq.${params.websiteId}&select=id,table_name,operation,tstamp,old_value,new_value,user_id,username&order=tstamp.desc`;

  if (userFilter && userFilter !== "all") {
    searchParams.append("username", `eq.${userFilter}`);
  }

  if (resourceFilter && resourceFilter !== "all") {
    searchParams.append("table_name", `eq.${resourceFilter}`);
  }

  if (operationFilter && operationFilter !== "all") {
    searchParams.append("operation", `eq.${operationFilter.toUpperCase()}`);
  }

  const constructedFetchUrl = `${baseFetchUrl}&${searchParams.toString()}&limit=50&offset=${resultOffset}`;

  const changeLogData = await fetch(constructedFetchUrl, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${cookies.get("session_token")}`
    }
  });

  const resultChangeLogData = await fetch(constructedFetchUrl, {
    method: "HEAD",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${cookies.get("session_token")}`,
      Prefer: "count=exact"
    }
  });

  const resultChangeLogCount = Number(
    resultChangeLogData.headers.get("content-range")?.split("/").at(-1)
  );

  const collabData = await fetch(
    `${API_BASE_PREFIX}/collab?website_id=eq.${params.websiteId}&select=*,user!user_id(*)&order=last_modified_at.desc,added_at.desc`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${cookies.get("session_token")}`
      }
    }
  );

  const changeLog: (ChangeLog & { user: { username: User["username"] } })[] =
    await changeLogData.json();
  const collaborators: (Collab & { user: User })[] = await collabData.json();
  const { website, home } = await parent();

  return {
    changeLog,
    resultChangeLogCount,
    website,
    home,
    collaborators
  };
};
