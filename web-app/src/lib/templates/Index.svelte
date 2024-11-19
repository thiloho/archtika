<script lang="ts">
  import { md, type WebsiteOverview } from "$lib/utils";
  import Head from "$lib/templates/Head.svelte";
  import Nav from "$lib/templates/Nav.svelte";
  import Footer from "$lib/templates/Footer.svelte";

  const {
    websiteOverview,
    apiUrl,
    websiteUrl
  }: {
    websiteOverview: WebsiteOverview;
    apiUrl: string;
    websiteUrl: string;
  } = $props();

  const sortedArticles = websiteOverview.article.sort((a, b) => {
    if (!a.publication_date) return 1;
    if (!b.publication_date) return -1;
    return new Date(b.publication_date).getTime() - new Date(a.publication_date).getTime();
  });
</script>

<Head
  {websiteOverview}
  nestingLevel={0}
  {apiUrl}
  title={websiteOverview.title}
  metaDescription={websiteOverview.home.meta_description}
  {websiteUrl}
/>

<Nav
  {websiteOverview}
  isDocsTemplate={websiteOverview.content_type === "Docs"}
  isIndexPage={true}
  {apiUrl}
/>

<header>
  <div class="container">
    <h1>{websiteOverview.title}</h1>
  </div>
</header>

<main>
  <div class="container">
    {@html md(websiteOverview.home.main_content, false)}

    {#if websiteOverview.article.length > 0 && websiteOverview.content_type === "Blog"}
      <section class="articles" id="articles">
        <h2>
          <a href="#articles">Articles</a>
        </h2>

        <ul class="unpadded">
          {#each sortedArticles as article}
            <li>
              {#if article.publication_date}
                <p>{article.publication_date}</p>
              {/if}
              <p>
                <strong>
                  <a href="./articles/{article.slug}">{article.title}</a>
                </strong>
              </p>
              {#if article.meta_description}
                <p>{article.meta_description}</p>
              {/if}
            </li>
          {/each}
        </ul>
      </section>
    {/if}
  </div>
</main>

<Footer {websiteOverview} />
