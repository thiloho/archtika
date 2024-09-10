import type { Actions, PageServerLoad } from "./$types";
import { API_BASE_PREFIX } from "$lib/server/utils";
import { rm } from "node:fs/promises";
import { join } from "node:path";
import type { LegalInformation, LegalInformationInput } from "$lib/db-schema";

export const load: PageServerLoad = async ({ parent, fetch, params, cookies }) => {
  const legalInformationData = await fetch(
    `${API_BASE_PREFIX}/legal_information?website_id=eq.${params.websiteId}`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${cookies.get("session_token")}`,
        Accept: "application/vnd.pgrst.object+json"
      }
    }
  );

  const legalInformation: LegalInformation = await legalInformationData.json();
  const { website } = await parent();

  return {
    legalInformation,
    website
  };
};

export const actions: Actions = {
  createUpdateLegalInformation: async ({ request, fetch, cookies, params }) => {
    const data = await request.formData();

    const res = await fetch(`${API_BASE_PREFIX}/legal_information`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${cookies.get("session_token")}`,
        Prefer: "resolution=merge-duplicates",
        Accept: "application/vnd.pgrst.object+json"
      },
      body: JSON.stringify({
        website_id: params.websiteId,
        main_content: data.get("main-content") as string
      } satisfies LegalInformationInput)
    });

    if (!res.ok) {
      const response = await res.json();
      return { success: false, message: response.message };
    }

    return {
      success: true,
      message: `Successfully ${res.status === 201 ? "created" : "updated"} legal information`
    };
  },
  deleteLegalInformation: async ({ fetch, cookies, params }) => {
    const res = await fetch(
      `${API_BASE_PREFIX}/legal_information?website_id=eq.${params.websiteId}`,
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

    await rm(
      join("/", "var", "www", "archtika-websites", params.websiteId, "legal-information.html"),
      { force: true }
    );

    return { success: true, message: `Successfully deleted legal information` };
  }
};
