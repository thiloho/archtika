import type { Actions, PageServerLoad } from "./$types";
import { API_BASE_PREFIX, apiRequest } from "$lib/server/utils";
import type { Collab, User } from "$lib/db-schema";

export const load: PageServerLoad = async ({ parent, params, fetch, locals }) => {
  const collaborators: (Collab & { user: User })[] = (
    await apiRequest(
      fetch,
      `${API_BASE_PREFIX}/collab?website_id=eq.${params.websiteId}&select=*,user!user_id(*)&order=last_modified_at.desc,added_at.desc`,
      "GET",
      {
        returnData: true
      }
    )
  ).data;

  const { website, home, permissionLevel } = await parent();

  return {
    website,
    home,
    collaborators,
    permissionLevel,
    user: locals.user
  };
};

export const actions: Actions = {
  addCollaborator: async ({ request, fetch, params }) => {
    const data = await request.formData();

    const user: User = (
      await apiRequest(
        fetch,
        `${API_BASE_PREFIX}/user?username=eq.${data.get("username")}`,
        "GET",
        {
          headers: {
            Accept: "application/vnd.pgrst.object+json"
          },
          returnData: true
        }
      )
    ).data;

    if (!user) {
      return { success: false, message: "Specified user could not be found" };
    }

    return await apiRequest(fetch, `${API_BASE_PREFIX}/collab`, "POST", {
      body: {
        website_id: params.websiteId,
        user_id: user.id,
        permission_level: data.get("permission-level")
      },
      successMessage: "Successfully added collaborator"
    });
  },
  updateCollaborator: async ({ request, fetch, params }) => {
    const data = await request.formData();

    return await apiRequest(
      fetch,
      `${API_BASE_PREFIX}/collab?website_id=eq.${params.websiteId}&user_id=eq.${data.get("user-id")}`,
      "PATCH",
      {
        body: {
          permission_level: data.get("permission-level")
        },
        successMessage: "Successfully updated collaborator"
      }
    );
  },
  removeCollaborator: async ({ request, fetch, params }) => {
    const data = await request.formData();

    return await apiRequest(
      fetch,
      `${API_BASE_PREFIX}/collab?website_id=eq.${params.websiteId}&user_id=eq.${data.get("user-id")}`,
      "DELETE",
      {
        successMessage: "Successfully removed collaborator"
      }
    );
  }
};
