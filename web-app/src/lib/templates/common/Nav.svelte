<script lang="ts">
  import type { WebsiteOverview } from "../../utils";
  import type { Article } from "../../db-schema";

  const {
    websiteOverview,
    isDocsTemplate,
    isIndexPage,
    apiUrl
  }: {
    websiteOverview: WebsiteOverview;
    isDocsTemplate: boolean;
    isIndexPage: boolean;
    apiUrl: string;
  } = $props();

  const categorizedArticles = Object.fromEntries(
    Object.entries(
      Object.groupBy(
        websiteOverview.article.sort((a, b) => (b.article_weight ?? 0) - (a.article_weight ?? 0)),
        (article) => article.docs_category?.category_name ?? "Uncategorized"
      )
    ).sort(([a], [b]) =>
      a === "Uncategorized"
        ? 1
        : b === "Uncategorized"
          ? -1
          : (websiteOverview.article.find((art) => art.docs_category?.category_name === b)
              ?.docs_category?.category_weight ?? 0) -
            (websiteOverview.article.find((art) => art.docs_category?.category_name === a)
              ?.docs_category?.category_weight ?? 0)
    )
  ) as { [key: string]: Article[] };
</script>

<nav>
  <div class="container">
    {#if isDocsTemplate && Object.keys(categorizedArticles).length > 0}
      <input type="checkbox" id="toggle-sidebar" hidden />
      <label for="toggle-sidebar">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 20 20"
          fill="currentColor"
          width="20"
          height="20"
        >
          <path
            fill-rule="evenodd"
            d="M2 4.75A.75.75 0 0 1 2.75 4h14.5a.75.75 0 0 1 0 1.5H2.75A.75.75 0 0 1 2 4.75ZM2 10a.75.75 0 0 1 .75-.75h14.5a.75.75 0 0 1 0 1.5H2.75A.75.75 0 0 1 2 10Zm0 5.25a.75.75 0 0 1 .75-.75h14.5a.75.75 0 0 1 0 1.5H2.75a.75.75 0 0 1-.75-.75Z"
            clip-rule="evenodd"
          ></path>
        </svg>
      </label>

      <section id="docs-navigation" class="docs-navigation">
        <ul>
          {#each Object.keys(categorizedArticles) as key}
            <li>
              <strong>{key}</strong>
              <ul>
                {#each categorizedArticles[key] as { title }}
                  {@const articleFileName = title.toLowerCase().split(" ").join("-")}
                  <li>
                    <a href="{isIndexPage ? './articles' : '.'}/{articleFileName}">{title}</a>
                  </li>
                {/each}
              </ul>
            </li>
          {/each}
        </ul>
      </section>
    {/if}
    <a href={isIndexPage ? "." : ".."}>
      {#if websiteOverview.header.logo_type === "text"}
        <strong>{websiteOverview.header.logo_text}</strong>
      {:else}
        <img
          src="{apiUrl}/rpc/retrieve_file?id={websiteOverview.header.logo_image}"
          width="24"
          height="24"
          alt=""
        />
      {/if}
    </a>
  </div>
</nav>
