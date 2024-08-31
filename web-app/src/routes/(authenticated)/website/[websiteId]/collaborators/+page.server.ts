import type { Actions, PageServerLoad } from "./$types";
import { API_BASE_PREFIX } from "$lib/server/utils";

export const load: PageServerLoad = async ({ parent, params, fetch, cookies }) => {
  const { website, home } = await parent();

  const collabData = await fetch(
    `${API_BASE_PREFIX}/collab?website_id=eq.${params.websiteId}&select=*,user!user_id(*)`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${cookies.get("session_token")}`
      }
    }
  );

  const collaborators = await collabData.json();

  return {
    website,
    home,
    collaborators
  };
};

export const actions: Actions = {
  addCollaborator: async ({ request, fetch, cookies, params }) => {
    const data = await request.formData();

    const userData = await fetch(`${API_BASE_PREFIX}/user?username=eq.${data.get("username")}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${cookies.get("session_token")}`,
        Accept: "application/vnd.pgrst.object+json"
      }
    });

    const res = await fetch(`${API_BASE_PREFIX}/collab`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${cookies.get("session_token")}`
      },
      body: JSON.stringify({
        website_id: params.websiteId,
        user_id: (await userData.json()).id,
        permission_level: data.get("permission-level")
      })
    });

    if (!res.ok) {
      const response = await res.json();
      return { success: false, message: response.message };
    }

    return { success: true, message: "Successfully added collaborator" };
  },
  updateCollaborator: async ({ request, fetch, cookies, params }) => {
    const data = await request.formData();

    const res = await fetch(
      `${API_BASE_PREFIX}/collab?website_id=eq.${params.websiteId}&user_id=eq.${data.get("user-id")}`,
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${cookies.get("session_token")}`
        },
        body: JSON.stringify({
          permission_level: data.get("permission-level")
        })
      }
    );

    if (!res.ok) {
      const response = await res.json();
      return { success: false, message: response.message };
    }

    return { success: true, message: "Successfully updated collaborator" };
  },
  removeCollaborator: async ({ request, fetch, cookies, params }) => {
    const data = await request.formData();

    const res = await fetch(
      `${API_BASE_PREFIX}/collab?website_id=eq.${params.websiteId}&user_id=eq.${data.get("user-id")}`,
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

    return { success: true, message: "Successfully removed collaborator" };
  }
};
