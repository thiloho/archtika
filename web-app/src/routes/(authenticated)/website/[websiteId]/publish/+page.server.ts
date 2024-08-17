import { readFile, mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { md } from "$lib/utils";
import type { Actions, PageServerLoad } from "./$types";
import { API_BASE_PREFIX, NGINX_BASE_PREFIX } from "$lib/utils";
import { render } from "svelte/server";
import BlogIndex from "$lib/templates/blog/BlogIndex.svelte";
import BlogArticle from "$lib/templates/blog/BlogArticle.svelte";

export const load: PageServerLoad = async ({ params, fetch, cookies }) => {
  const websiteOverviewData = await fetch(
    `${API_BASE_PREFIX}/website_overview?id=eq.${params.websiteId}`,
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

  generateStaticFiles(websiteOverview);

  const websitePreviewUrl = `${NGINX_BASE_PREFIX}/previews/${websiteOverview.user_id}/${websiteOverview.id}/index.html`;

  return {
    websiteOverview,
    websitePreviewUrl
  };
};

export const actions: Actions = {
  publishWebsite: async ({ request }) => {
    const data = await request.formData();
    const websiteOverview = JSON.parse(data.get("website-overview") as string);

    generateStaticFiles(websiteOverview, false);

    return { success: true, message: "Successfully published website" };
  }
};

const generateStaticFiles = async (websiteData: any, isPreview: boolean = true) => {
  const { head, body } = render(BlogIndex, {
    props: {
      title: websiteData.title,
      logoType: websiteData.logo_type,
      logo: websiteData.logo_text,
      mainContent: md.render(websiteData.main_content ?? ""),
      articles: websiteData.articles ?? [],
      footerAdditionalText: websiteData.additional_text ?? ""
    }
  });

  const indexFileContents = head.concat(body);

  let uploadDir = "";

  if (isPreview) {
    uploadDir = join(
      "/",
      "var",
      "www",
      "archtika-websites",
      "previews",
      websiteData.user_id,
      websiteData.id
    );
  } else {
    uploadDir = join("/", "var", "www", "archtika-websites", websiteData.user_id, websiteData.id);
  }

  await mkdir(uploadDir, { recursive: true });
  await writeFile(join(uploadDir, "index.html"), indexFileContents);
  await mkdir(join(uploadDir, "articles"), { recursive: true });

  for (const article of websiteData.articles ?? []) {
    const articleFileName = article.title.toLowerCase().split(" ").join("-");

    const { head, body } = render(BlogArticle, {
      props: {
        title: article.title,
        logoType: websiteData.logo_type,
        logo: websiteData.logo_text,
        coverImage: article.cover_image
          ? `${API_BASE_PREFIX}/rpc/retrieve_file?id=${article.cover_image}`
          : "",
        publicationDate: article.publication_date,
        mainContent: md.render(article.main_content ?? ""),
        footerAdditionalText: websiteData.additional_text ?? ""
      }
    });

    const articleFileContents = head.concat(body);

    await writeFile(join(uploadDir, "articles", `${articleFileName}.html`), articleFileContents);
  }

  const styles = await readFile(`${process.cwd()}/template-styles/blog-styles.css`, {
    encoding: "utf-8"
  });
  await writeFile(join(uploadDir, "styles.css"), styles);
};
