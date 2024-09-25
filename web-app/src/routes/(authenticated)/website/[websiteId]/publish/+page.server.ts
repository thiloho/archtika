import { readFile, mkdir, writeFile, rename } from "node:fs/promises";
import { join } from "node:path";
import { type WebsiteOverview, slugify } from "$lib/utils";
import type { Actions, PageServerLoad } from "./$types";
import { API_BASE_PREFIX, apiRequest } from "$lib/server/utils";
import { render } from "svelte/server";
import BlogIndex from "$lib/templates/blog/BlogIndex.svelte";
import BlogArticle from "$lib/templates/blog/BlogArticle.svelte";
import DocsIndex from "$lib/templates/docs/DocsIndex.svelte";
import DocsArticle from "$lib/templates/docs/DocsArticle.svelte";
import { dev } from "$app/environment";

export const load: PageServerLoad = async ({ params, fetch }) => {
  const websiteOverview: WebsiteOverview = (
    await apiRequest(
      fetch,
      `${API_BASE_PREFIX}/website?id=eq.${params.websiteId}&select=*,settings(*),header(*),home(*),footer(*),article(*,docs_category(*)),legal_information(*),domain_prefix(*)`,
      "GET",
      {
        headers: {
          Accept: "application/vnd.pgrst.object+json"
        },
        returnData: true
      }
    )
  ).data;

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
  publishWebsite: async ({ fetch, params }) => {
    const websiteOverview: WebsiteOverview = (
      await apiRequest(
        fetch,
        `${API_BASE_PREFIX}/website?id=eq.${params.websiteId}&select=*,settings(*),header(*),home(*),footer(*),article(*,docs_category(*)),legal_information(*),domain_prefix(*)`,
        "GET",
        {
          headers: {
            Accept: "application/vnd.pgrst.object+json"
          },
          returnData: true
        }
      )
    ).data;

    generateStaticFiles(websiteOverview, false);

    return await apiRequest(
      fetch,
      `${API_BASE_PREFIX}/website?id=eq.${params.websiteId}`,
      "PATCH",
      {
        body: {
          is_published: true
        },
        successMessage: "Successfully published website"
      }
    );
  },
  createUpdateCustomDomainPrefix: async ({ request, fetch, params }) => {
    const data = await request.formData();

    const oldDomainPrefix = (
      await apiRequest(
        fetch,
        `${API_BASE_PREFIX}/domain_prefix?website_id=eq.${params.websiteId}`,
        "GET",
        {
          headers: {
            Accept: "application/vnd.pgrst.object+json"
          },
          returnData: true
        }
      )
    ).data;

    const newDomainPrefix = await apiRequest(fetch, `${API_BASE_PREFIX}/domain_prefix`, "POST", {
      headers: {
        Prefer: "resolution=merge-duplicates",
        Accept: "application/vnd.pgrst.object+json"
      },
      body: {
        website_id: params.websiteId,
        prefix: data.get("domain-prefix")
      },
      successMessage: "Successfully created/updated domain prefix"
    });

    if (!newDomainPrefix.success) {
      return newDomainPrefix;
    }

    await rename(
      join(
        "/",
        "var",
        "www",
        "archtika-websites",
        oldDomainPrefix?.prefix ? oldDomainPrefix.prefix : params.websiteId
      ),
      join("/", "var", "www", "archtika-websites", data.get("domain-prefix") as string)
    );

    return newDomainPrefix;
  },
  deleteCustomDomainPrefix: async ({ fetch, params }) => {
    const customPrefix = await apiRequest(
      fetch,
      `${API_BASE_PREFIX}/domain_prefix?website_id=eq.${params.websiteId}`,
      "DELETE",
      {
        headers: {
          Prefer: "return=representation",
          Accept: "application/vnd.pgrst.object+json"
        },
        successMessage: "Successfully deleted domain prefix",
        returnData: true
      }
    );

    if (!customPrefix.success) {
      return customPrefix;
    }

    await rename(
      join("/", "var", "www", "archtika-websites", customPrefix.data.prefix),
      join("/", "var", "www", "archtika-websites", params.websiteId)
    );

    return customPrefix;
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

  console.log(websiteData);

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
