import { dev } from "$app/environment";
import { API_BASE_PREFIX, apiRequest } from "$lib/server/utils";
import Index from "$lib/templates/Index.svelte";
import Article from "$lib/templates/Article.svelte";
import { type WebsiteOverview, hexToHSL } from "$lib/utils";
import { mkdir, writeFile, chmod, readdir, rm, readFile } from "node:fs/promises";
import { join } from "node:path";
import { render } from "svelte/server";
import type { Actions, PageServerLoad } from "./$types";

const getOverviewFetchUrl = (websiteId: string) => {
  return `${API_BASE_PREFIX}/website?id=eq.${websiteId}&select=*,user!user_id(*),settings(*),header(*),home(*),footer(*),article(*,docs_category(*))`;
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
  const prodIsGenerated = (await fetch(websiteProdUrl, { method: "HEAD" })).ok;

  let currentMeta = null;
  try {
    const metaPath = join(
      "/var/www/archtika-websites",
      websiteOverview.user.username,
      websiteOverview.slug as string,
      ".publication-meta.json"
    );
    const metaContent = await readFile(metaPath, "utf-8");
    currentMeta = JSON.parse(metaContent);
  } catch {
    currentMeta = null;
  }

  const { website, permissionLevel } = await parent();

  return {
    websiteOverview,
    websitePreviewUrl,
    websiteProdUrl,
    permissionLevel,
    prodIsGenerated,
    currentMeta,
    website
  };
};

export const actions: Actions = {
  publishWebsite: async ({ fetch, params, locals }) => {
    const websiteOverview: WebsiteOverview = (
      await apiRequest(fetch, getOverviewFetchUrl(params.websiteId), "GET", {
        headers: {
          Accept: "application/vnd.pgrst.object+json"
        },
        returnData: true
      })
    ).data;

    let permissionLevel = 40;

    if (websiteOverview.user_id !== locals.user.id) {
      permissionLevel = (
        await apiRequest(
          fetch,
          `${API_BASE_PREFIX}/collab?select=permission_level&website_id=eq.${params.websiteId}&user_id=eq.${locals.user.id}`,
          "GET",
          {
            headers: {
              Accept: "application/vnd.pgrst.object+json"
            },
            returnData: true
          }
        )
      ).data.permission_level;
    }

    if (permissionLevel < 30) {
      return { success: false, message: "Insufficient permissions" };
    }

    await generateStaticFiles(websiteOverview, false, fetch);

    return { success: true, message: "Successfully published website" };
  }
};

const generateStaticFiles = async (
  websiteData: WebsiteOverview,
  isPreview = true,
  customFetch: typeof fetch = fetch
) => {
  const websitePreviewUrl = `${
    dev
      ? "http://127.0.0.1:18000"
      : process.env.ORIGIN
        ? process.env.ORIGIN
        : "http://127.0.0.1:18000"
  }/previews/${websiteData.id}/`;

  const websiteProdUrl = dev
    ? `http://127.0.0.1:18000/${websiteData.user.username}/${websiteData.slug}`
    : process.env.ORIGIN
      ? `${process.env.ORIGIN.replace("//", `//${websiteData.user.username}.`)}/${websiteData.slug}`
      : `http://127.0.0.1:18000/${websiteData.user.username}/${websiteData.slug}`;

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

  const { head, body } = render(Index, {
    props: {
      websiteOverview: websiteData,
      apiUrl: API_BASE_PREFIX,
      websiteUrl: isPreview ? websitePreviewUrl : websiteProdUrl
    }
  });

  let uploadDir = "";

  if (isPreview) {
    uploadDir = join("/", "var", "www", "archtika-websites", "previews", websiteData.id);
    await mkdir(uploadDir, { recursive: true });
  } else {
    uploadDir = join(
      "/",
      "var",
      "www",
      "archtika-websites",
      websiteData.user.username,
      websiteData.slug ?? websiteData.id
    );

    const articlesDir = join(uploadDir, "articles");
    let existingArticles: string[] = [];
    try {
      existingArticles = await readdir(articlesDir);
    } catch {
      existingArticles = [];
    }
    const currentArticleSlugs = websiteData.article?.map((article) => `${article.slug}.html`) ?? [];

    for (const file of existingArticles) {
      if (!currentArticleSlugs.includes(file)) {
        await rm(join(articlesDir, file));
      }
    }

    const latestChange = await apiRequest(
      customFetch,
      `${API_BASE_PREFIX}/change_log?website_id=eq.${websiteData.id}&order=tstamp.desc&limit=1`,
      "GET",
      {
        headers: {
          Accept: "application/vnd.pgrst.object+json"
        },
        returnData: true
      }
    );

    const meta = {
      lastPublishedAt: new Date().toISOString(),
      lastChangeLogId: latestChange?.data?.id
    };

    await mkdir(uploadDir, { recursive: true });
    await writeFile(join(uploadDir, ".publication-meta.json"), JSON.stringify(meta, null, 2));
  }

  await writeFile(join(uploadDir, "index.html"), fileContents(head, body));
  await mkdir(join(uploadDir, "articles"), {
    recursive: true
  });

  for (const article of websiteData.article ?? []) {
    const { head, body } = render(Article, {
      props: {
        websiteOverview: websiteData,
        article,
        apiUrl: API_BASE_PREFIX,
        websiteUrl: isPreview ? websitePreviewUrl : websiteProdUrl
      }
    });

    await writeFile(join(uploadDir, "articles", `${article.slug}.html`), fileContents(head, body));
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

  await setPermissions(join(uploadDir, "../"));

  return { websitePreviewUrl, websiteProdUrl };
};

const setPermissions = async (dir: string) => {
  const mode = dev ? 0o777 : process.env.ORIGIN ? 0o770 : 0o777;
  await chmod(dir, mode);
  const entries = await readdir(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = join(dir, entry.name);
    if (entry.isDirectory()) {
      await setPermissions(fullPath);
    } else {
      await chmod(fullPath, mode);
    }
  }
};
