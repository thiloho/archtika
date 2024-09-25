import type { Actions, PageServerLoad } from "./$types";
import { API_BASE_PREFIX, apiRequest } from "$lib/server/utils";
import { rm } from "node:fs/promises";
import { join } from "node:path";
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

  const { website } = await parent();

  return {
    legalInformation,
    website
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

    await rm(
      join("/", "var", "www", "archtika-websites", params.websiteId, "legal-information.html"),
      { force: true }
    );

    return deleteLegalInformation;
  }
};
