import type { Actions, PageServerLoad } from "./$types";
import { API_BASE_PREFIX, apiRequest } from "$lib/server/utils";
import type { LegalInformation } from "$lib/db-schema";

export const load: PageServerLoad = async ({ parent, fetch, params }) => {
  const legalInformation: LegalInformation = (
    await apiRequest(
      fetch,
      `${API_BASE_PREFIX}/legal_information?website_id=eq.${params.websiteId}`,
      "GET",
      {
        headers: {
          Accept: "application/vnd.pgrst.object+json"
        },
        returnData: true
      }
    )
  ).data;

  const { website, permissionLevel } = await parent();

  return {
    legalInformation,
    website,
    API_BASE_PREFIX,
    permissionLevel
  };
};

export const actions: Actions = {
  createUpdateLegalInformation: async ({ request, fetch, params }) => {
    const data = await request.formData();

    return await apiRequest(fetch, `${API_BASE_PREFIX}/legal_information`, "POST", {
      headers: {
        Prefer: "resolution=merge-duplicates",
        Accept: "application/vnd.pgrst.object+json"
      },
      body: {
        website_id: params.websiteId,
        main_content: data.get("main-content")
      },
      successMessage: "Successfully created/updated legal information"
    });
  },
  deleteLegalInformation: async ({ fetch, params }) => {
    const deleteLegalInformation = await apiRequest(
      fetch,
      `${API_BASE_PREFIX}/legal_information?website_id=eq.${params.websiteId}`,
      "DELETE",
      {
        successMessage: "Successfully deleted legal information"
      }
    );

    if (!deleteLegalInformation.success) {
      return deleteLegalInformation;
    }

    return deleteLegalInformation;
  },
  pasteImage: async ({ request, fetch, params }) => {
    const data = await request.formData();
    const file = data.get("file") as File;

    return await apiRequest(fetch, `${API_BASE_PREFIX}/rpc/upload_file`, "POST", {
      headers: {
        "Content-Type": "application/octet-stream",
        Accept: "application/vnd.pgrst.object+json",
        "X-Website-Id": params.websiteId,
        "X-Mimetype": file.type,
        "X-Original-Filename": file.name
      },
      body: await file.arrayBuffer(),
      successMessage: "Successfully uploaded image",
      returnData: true
    });
  }
};
