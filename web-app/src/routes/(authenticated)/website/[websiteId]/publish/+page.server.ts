import { readFile, mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { md } from "$lib/utils";

export const load = async ({ params, fetch, cookies, locals }) => {
  const websiteOverviewData = await fetch(
    `http://localhost:3000/website_overview?id=eq.${params.websiteId}`,
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

  const templatePath = join(
    process.cwd(),
    "..",
    "templates",
    websiteOverview.content_type.toLowerCase()
  );

  const indexFile = await readFile(join(templatePath, "index.html"), { encoding: "utf-8" });
  const articleFileContents = await readFile(join(templatePath, "article.html"), {
    encoding: "utf-8"
  });

  const indexFileContents = indexFile
    .replace("{{title}}", `<h1>${websiteOverview.title}</h1>`)
    .replace("{{main_content}}", md.render(websiteOverview.main_content))
    .replace("{{additional_text}}", md.render(websiteOverview.additional_text));

  const uploadDir = join(
    process.cwd(),
    "static",
    "user-websites",
    locals.user.id,
    params.websiteId
  );
  await mkdir(uploadDir, { recursive: true });

  await writeFile(join(uploadDir, "index.html"), indexFileContents);

  await mkdir(join(uploadDir, "articles"), { recursive: true });

  for (const article of websiteOverview.articles) {
    const articleFileName = article.title.toLowerCase().split(" ").join("-");

    await writeFile(join(uploadDir, "articles", `${articleFileName}.html`), articleFileContents);
  }

  return {
    websiteOverview
  };
};

export const actions = {
  publishWebsite: async ({ fetch }) => {
    console.log("test");
  }
};

const generateWebsiteOutput = async () => {};
