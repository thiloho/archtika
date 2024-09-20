import { readFile, mkdir, writeFile, rename } from "node:fs/promises";
import { join } from "node:path";
import { type WebsiteOverview, slugify } from "$lib/utils";
import type { Actions, PageServerLoad } from "./$types";
import { API_BASE_PREFIX } from "$lib/server/utils";
import { render } from "svelte/server";
import BlogIndex from "$lib/templates/blog/BlogIndex.svelte";
import BlogArticle from "$lib/templates/blog/BlogArticle.svelte";
import DocsIndex from "$lib/templates/docs/DocsIndex.svelte";
import DocsArticle from "$lib/templates/docs/DocsArticle.svelte";
import { dev } from "$app/environment";
import type { DomainPrefixInput } from "$lib/db-schema";

export const load: PageServerLoad = async ({ params, fetch, cookies }) => {
  const websiteOverviewData = await fetch(
    `${API_BASE_PREFIX}/website?id=eq.${params.websiteId}&select=*,settings(*),header(*),home(*),footer(*),article(*,docs_category(*)),legal_information(*),domain_prefix(*)`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${cookies.get("session_token")}`,
        Accept: "application/vnd.pgrst.object+json"
      }
    }
  );

  const websiteOverview: WebsiteOverview = await websiteOverviewData.json();

  generateStaticFiles(websiteOverview);

  const websitePreviewUrl = `${
    dev
      ? "http://localhost:18000"
      : process.env.ORIGIN
        ? process.env.ORIGIN
        : "http://localhost:18000"
  }/previews/${websiteOverview.id}/`;

  const websiteProdUrl = dev
    ? `http://localhost:18000/${websiteOverview.domain_prefix?.prefix ?? websiteOverview.id}/`
    : process.env.ORIGIN
      ? process.env.ORIGIN.replace(
          "//",
          `//${websiteOverview.domain_prefix?.prefix ?? websiteOverview.id}.`
        )
      : `http://localhost:18000/${websiteOverview.domain_prefix?.prefix ?? websiteOverview.id}/`;

  return {
    websiteOverview,
    websitePreviewUrl,
    websiteProdUrl
  };
};

export const actions: Actions = {
  publishWebsite: async ({ fetch, params, cookies }) => {
    const websiteOverviewData = await fetch(
      `${API_BASE_PREFIX}/website?id=eq.${params.websiteId}&select=*,settings(*),header(*),home(*),footer(*),article(*,docs_category(*)),legal_information(*),domain_prefix(*)`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${cookies.get("session_token")}`,
          Accept: "application/vnd.pgrst.object+json"
        }
      }
    );

    const websiteOverview = await websiteOverviewData.json();
    generateStaticFiles(websiteOverview, false);

    const res = await fetch(`${API_BASE_PREFIX}/website?id=eq.${params.websiteId}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${cookies.get("session_token")}`
      },
      body: JSON.stringify({
        is_published: true
      })
    });

    if (!res.ok) {
      const response = await res.json();
      return { success: false, message: response.message };
    }

    return { success: true, message: "Successfully published website" };
  },
  createUpdateCustomDomainPrefix: async ({ request, fetch, params, cookies }) => {
    const data = await request.formData();

    const oldDomainPrefixData = await fetch(
      `${API_BASE_PREFIX}/domain_prefix?website_id=eq.${params.websiteId}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${cookies.get("session_token")}`,
          Accept: "application/vnd.pgrst.object+json"
        }
      }
    );
    const oldDomainPrefix = await oldDomainPrefixData.json();

    const res = await fetch(`${API_BASE_PREFIX}/domain_prefix`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${cookies.get("session_token")}`,
        Prefer: "resolution=merge-duplicates",
        Accept: "application/vnd.pgrst.object+json"
      },
      body: JSON.stringify({
        website_id: params.websiteId,
        prefix: data.get("domain-prefix") as string
      } satisfies DomainPrefixInput)
    });

    if (!res.ok) {
      const response = await res.json();
      return { success: false, message: response.message };
    }

    await rename(
      join(
        "/",
        "var",
        "www",
        "archtika-websites",
        res.status === 201 ? params.websiteId : oldDomainPrefix.prefix
      ),
      join("/", "var", "www", "archtika-websites", data.get("domain-prefix") as string)
    );

    return {
      success: true,
      message: `Successfully ${res.status === 201 ? "created" : "updated"} domain prefix`
    };
  },
  deleteCustomDomainPrefix: async ({ fetch, params, cookies }) => {
    const res = await fetch(`${API_BASE_PREFIX}/domain_prefix?website_id=eq.${params.websiteId}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${cookies.get("session_token")}`,
        Prefer: "return=representation",
        Accept: "application/vnd.pgrst.object+json"
      }
    });

    const response = await res.json();

    if (!res.ok) {
      return { success: false, message: response.message };
    }

    await rename(
      join("/", "var", "www", "archtika-websites", response.prefix),
      join("/", "var", "www", "archtika-websites", params.websiteId)
    );

    return { success: true, message: `Successfully deleted domain prefix` };
  }
};

const generateStaticFiles = async (websiteData: WebsiteOverview, isPreview = true) => {
  const fileContents = (head: string, body: string) => {
    return `
<!DOCTYPE html>
<html lang="en">
  <head>
    ${head}
  </head>
  <body>
    ${body}
  </body>
</html>`;
  };

  const { head, body } = render(websiteData.content_type === "Blog" ? BlogIndex : DocsIndex, {
    props: {
      websiteOverview: websiteData,
      apiUrl: API_BASE_PREFIX,
      isLegalPage: false
    }
  });

  let uploadDir = "";

  if (isPreview) {
    uploadDir = join("/", "var", "www", "archtika-websites", "previews", websiteData.id);
  } else {
    uploadDir = join(
      "/",
      "var",
      "www",
      "archtika-websites",
      websiteData.domain_prefix?.prefix ?? websiteData.id
    );
  }

  await mkdir(uploadDir, { recursive: true });
  await writeFile(join(uploadDir, "index.html"), fileContents(head, body));
  await mkdir(join(uploadDir, "articles"), {
    recursive: true
  });

  for (const article of websiteData.article ?? []) {
    const { head, body } = render(websiteData.content_type === "Blog" ? BlogArticle : DocsArticle, {
      props: {
        websiteOverview: websiteData,
        article,
        apiUrl: API_BASE_PREFIX
      }
    });

    await writeFile(
      join(uploadDir, "articles", `${slugify(article.title)}.html`),
      fileContents(head, body)
    );
  }

  if (websiteData.legal_information) {
    const { head, body } = render(websiteData.content_type === "Blog" ? BlogIndex : DocsIndex, {
      props: {
        websiteOverview: websiteData,
        apiUrl: API_BASE_PREFIX,
        isLegalPage: true
      }
    });

    await writeFile(join(uploadDir, "legal-information.html"), fileContents(head, body));
  }

  const commonStyles = await readFile(`${process.cwd()}/template-styles/common-styles.css`, {
    encoding: "utf-8"
  });
  const specificStyles = await readFile(
    `${process.cwd()}/template-styles/${websiteData.content_type.toLowerCase()}-styles.css`,
    {
      encoding: "utf-8"
    }
  );
  await writeFile(
    join(uploadDir, "styles.css"),
    commonStyles
      .concat(specificStyles)
      .replace(
        /--color-accent:\s*(.*?);/,
        `--color-accent: ${websiteData.settings.accent_color_dark_theme};`
      )
      .replace(
        /@media\s*\(prefers-color-scheme:\s*dark\)\s*{[^}]*--color-accent:\s*(.*?);/,
        (match) =>
          match.replace(
            /--color-accent:\s*(.*?);/,
            `--color-accent: ${websiteData.settings.accent_color_light_theme};`
          )
      )
  );
};
