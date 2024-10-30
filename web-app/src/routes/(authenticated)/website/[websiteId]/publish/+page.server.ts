import { dev } from "$app/environment";
import { API_BASE_PREFIX, apiRequest } from "$lib/server/utils";
import BlogArticle from "$lib/templates/blog/BlogArticle.svelte";
import BlogIndex from "$lib/templates/blog/BlogIndex.svelte";
import DocsArticle from "$lib/templates/docs/DocsArticle.svelte";
import DocsIndex from "$lib/templates/docs/DocsIndex.svelte";
import { type WebsiteOverview, hexToHSL } from "$lib/utils";
import { mkdir, readFile, writeFile, chmod, readdir } from "node:fs/promises";
import { join } from "node:path";
import { render } from "svelte/server";
import type { Actions, PageServerLoad } from "./$types";

const getOverviewFetchUrl = (websiteId: string) => {
  return `${API_BASE_PREFIX}/website?id=eq.${websiteId}&select=*,settings(*),header(*),home(*),footer(*),article(*,docs_category(*)),legal_information(*),domain_prefix(*)`;
};

export const load: PageServerLoad = async ({ params, fetch, parent }) => {
  const websiteOverview: WebsiteOverview = (
    await apiRequest(fetch, getOverviewFetchUrl(params.websiteId), "GET", {
      headers: {
        Accept: "application/vnd.pgrst.object+json"
      },
      returnData: true
    })
  ).data;

  const { websitePreviewUrl, websiteProdUrl } = await generateStaticFiles(websiteOverview);

  const { permissionLevel } = await parent();

  return {
    websiteOverview,
    websitePreviewUrl,
    websiteProdUrl,
    permissionLevel
  };
};

export const actions: Actions = {
  publishWebsite: async ({ fetch, params }) => {
    const websiteOverview: WebsiteOverview = (
      await apiRequest(fetch, getOverviewFetchUrl(params.websiteId), "GET", {
        headers: {
          Accept: "application/vnd.pgrst.object+json"
        },
        returnData: true
      })
    ).data;

    const publish = await apiRequest(
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

    if (!publish.success) {
      return publish;
    }

    await generateStaticFiles(websiteOverview, false);

    return publish;
  },
  createUpdateCustomDomainPrefix: async ({ request, fetch, params }) => {
    const data = await request.formData();

    return await apiRequest(fetch, `${API_BASE_PREFIX}/rpc/set_domain_prefix`, "POST", {
      body: {
        website_id: params.websiteId,
        prefix: data.get("domain-prefix")
      },
      successMessage: "Successfully created/updated domain prefix"
    });
  },
  deleteCustomDomainPrefix: async ({ fetch, params }) => {
    return await apiRequest(fetch, `${API_BASE_PREFIX}/rpc/delete_domain_prefix`, "POST", {
      body: {
        website_id: params.websiteId
      },
      successMessage: "Successfully deleted domain prefix"
    });
  }
};

const generateStaticFiles = async (websiteData: WebsiteOverview, isPreview = true) => {
  const websitePreviewUrl = `${
    dev
      ? "http://localhost:18000"
      : process.env.ORIGIN
        ? process.env.ORIGIN
        : "http://localhost:18000"
  }/previews/${websiteData.id}/`;

  const websiteProdUrl = dev
    ? `http://localhost:18000/${websiteData.domain_prefix?.prefix ?? websiteData.id}/`
    : process.env.ORIGIN
      ? process.env.ORIGIN.replace(
          "//",
          `//${websiteData.domain_prefix?.prefix ?? websiteData.id}.`
        )
      : `http://localhost:18000/${websiteData.domain_prefix?.prefix ?? websiteData.id}/`;

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
      isLegalPage: false,
      websiteUrl: isPreview ? websitePreviewUrl : websiteProdUrl
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
        apiUrl: API_BASE_PREFIX,
        websiteUrl: isPreview ? websitePreviewUrl : websiteProdUrl
      }
    });

    await writeFile(join(uploadDir, "articles", `${article.slug}.html`), fileContents(head, body));
  }

  if (websiteData.legal_information) {
    const { head, body } = render(websiteData.content_type === "Blog" ? BlogIndex : DocsIndex, {
      props: {
        websiteOverview: websiteData,
        apiUrl: API_BASE_PREFIX,
        isLegalPage: true,
        websiteUrl: isPreview ? websitePreviewUrl : websiteProdUrl
      }
    });

    await writeFile(join(uploadDir, "legal-information.html"), fileContents(head, body));
  }

  const variableStyles = await readFile(`${process.cwd()}/template-styles/variables.css`, {
    encoding: "utf-8"
  });
  const commonStyles = await readFile(`${process.cwd()}/template-styles/common-styles.css`, {
    encoding: "utf-8"
  });
  const specificStyles = await readFile(
    `${process.cwd()}/template-styles/${websiteData.content_type.toLowerCase()}-styles.css`,
    {
      encoding: "utf-8"
    }
  );

  const {
    h: hDark,
    s: sDark,
    l: lDark
  } = hexToHSL(websiteData.settings.background_color_dark_theme);
  const {
    h: hLight,
    s: sLight,
    l: lLight
  } = hexToHSL(websiteData.settings.background_color_light_theme);

  await writeFile(
    join(uploadDir, "variables.css"),
    variableStyles
      .replaceAll(
        /\/\* BACKGROUND_COLOR_DARK_THEME_H \*\/\s*.*?;/g,
        `/* BACKGROUND_COLOR_DARK_THEME_H */ ${hDark};`
      )
      .replaceAll(
        /\/\* BACKGROUND_COLOR_DARK_THEME_S \*\/\s*.*?;/g,
        `/* BACKGROUND_COLOR_DARK_THEME_S */ ${sDark}%;`
      )
      .replaceAll(
        /\/\* BACKGROUND_COLOR_DARK_THEME_L \*\/\s*.*?;/g,
        `/* BACKGROUND_COLOR_DARK_THEME_L */ ${lDark}%;`
      )
      .replaceAll(
        /\/\* BACKGROUND_COLOR_LIGHT_THEME_H \*\/\s*.*?;/g,
        `/* BACKGROUND_COLOR_LIGHT_THEME_H */ ${hLight};`
      )
      .replaceAll(
        /\/\* BACKGROUND_COLOR_LIGHT_THEME_S \*\/\s*.*?;/g,
        `/* BACKGROUND_COLOR_LIGHT_THEME_S */ ${sLight}%;`
      )
      .replaceAll(
        /\/\* BACKGROUND_COLOR_LIGHT_THEME_L \*\/\s*.*?;/g,
        `/* BACKGROUND_COLOR_LIGHT_THEME_L */ ${lLight}%;`
      )
      .replaceAll(
        /\/\* ACCENT_COLOR_DARK_THEME \*\/\s*.*?;/g,
        `/* ACCENT_COLOR_DARK_THEME */ ${websiteData.settings.accent_color_dark_theme};`
      )
      .replaceAll(
        /\/\* ACCENT_COLOR_LIGHT_THEME \*\/\s*.*?;/g,
        `/* ACCENT_COLOR_LIGHT_THEME */ ${websiteData.settings.accent_color_light_theme};`
      )
  );
  await writeFile(join(uploadDir, "common.css"), commonStyles);
  await writeFile(join(uploadDir, "scoped.css"), specificStyles);

  await setPermissions(isPreview ? join(uploadDir, "../") : uploadDir);

  return { websitePreviewUrl, websiteProdUrl };
};

const setPermissions = async (dir: string) => {
  await chmod(dir, 0o777);
  const entries = await readdir(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = join(dir, entry.name);
    if (entry.isDirectory()) {
      await setPermissions(fullPath);
    } else {
      await chmod(fullPath, 0o777);
    }
  }
};
