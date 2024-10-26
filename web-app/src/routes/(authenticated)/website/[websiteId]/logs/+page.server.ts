import type { PageServerLoad, Actions } from "./$types";
import { API_BASE_PREFIX, apiRequest } from "$lib/server/utils";
import type { ChangeLog, User, Collab } from "$lib/db-schema";
import DiffMatchPatch from "diff-match-patch";
import { PAGINATION_MAX_ITEMS } from "$lib/utils";

export const load: PageServerLoad = async ({ parent, fetch, params, url }) => {
  const userFilter = url.searchParams.get("user");
  const resourceFilter = url.searchParams.get("resource");
  const operationFilter = url.searchParams.get("operation");
  const currentPage = Number.parseInt(url.searchParams.get("page") ?? "1");
  const resultOffset = (currentPage - 1) * PAGINATION_MAX_ITEMS;

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

  const constructedFetchUrl = `${baseFetchUrl}&${searchParams.toString()}&limit=${PAGINATION_MAX_ITEMS}&offset=${resultOffset}`;

  const changeLog: (ChangeLog & { user: { username: User["username"] } })[] = (
    await apiRequest(fetch, constructedFetchUrl, "GET", {
      headers: { Accept: "application/vnd.pgrst.array+json;nulls=stripped" },
      returnData: true
    })
  ).data;

  const resultChangeLogData = await apiRequest(fetch, constructedFetchUrl, "HEAD", {
    headers: {
      Prefer: "count=exact"
    },
    returnData: true
  });

  const resultChangeLogCount = Number(
    resultChangeLogData.data.headers.get("content-range")?.split("/").at(-1)
  );

  const collaborators: (Collab & { user: User })[] = (
    await apiRequest(
      fetch,
      `${API_BASE_PREFIX}/collab?website_id=eq.${params.websiteId}&select=*,user!user_id(*)&order=last_modified_at.desc,added_at.desc`,
      "GET",
      { returnData: true }
    )
  ).data;

  const { website, home } = await parent();

  return {
    changeLog,
    resultChangeLogCount,
    website,
    home,
    collaborators
  };
};

export const actions: Actions = {
  computeDiff: async ({ request, fetch }) => {
    const data = await request.formData();

    const dmp = new DiffMatchPatch();

    const htmlDiff = (oldValue: string, newValue: string) => {
      const diff = dmp.diff_main(oldValue, newValue);
      dmp.diff_cleanupSemantic(diff);

      return diff
        .map(([op, text]) => {
          switch (op) {
            case 1:
              return `<ins>${text}</ins>`;
            case -1:
              return `<del>${text}</del>`;
            default:
              return text;
          }
        })
        .join("");
    };

    const log: ChangeLog = (
      await apiRequest(
        fetch,
        `${API_BASE_PREFIX}/change_log?id=eq.${data.get("id")}&select=old_value,new_value`,
        "GET",
        {
          headers: { Accept: "application/vnd.pgrst.object+json;nulls=stripped" },
          returnData: true
        }
      )
    ).data;

    return {
      logId: data.get("id"),
      currentDiff: htmlDiff(
        JSON.stringify(log.old_value, null, 2),
        JSON.stringify(log.new_value, null, 2)
      )
    };
  }
};
