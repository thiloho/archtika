<script lang="ts">
  import { md, type WebsiteOverview } from "$lib/utils";
  import type { Article } from "$lib/db-schema";
  import Head from "$lib/templates/Head.svelte";
  import Nav from "$lib/templates/Nav.svelte";
  import Footer from "$lib/templates/Footer.svelte";

  const {
    websiteOverview,
    article,
    apiUrl,
    websiteUrl
  }: {
    websiteOverview: WebsiteOverview;
    article: Article;
    apiUrl: string;
    websiteUrl: string;
  } = $props();
</script>

<Head
  {websiteOverview}
  nestingLevel={1}
  {apiUrl}
  title={article.title}
  slug={article.slug as string}
  metaDescription={article.meta_description}
  {websiteUrl}
/>

<Nav
  {websiteOverview}
  isDocsTemplate={websiteOverview.content_type === "Docs"}
  isIndexPage={false}
  {apiUrl}
/>

<header>
  <div class="container">
    {#if websiteOverview.content_type === "Blog"}
      <hgroup>
        {#if article.publication_date}
          <p>{article.publication_date}</p>
        {/if}
        <h1>{article.title}</h1>
      </hgroup>
      {#if article.cover_image}
        <img src="{apiUrl}/rpc/retrieve_file?id={article.cover_image}" alt="" />
      {/if}
    {:else}
      <h1>{article.title}</h1>
    {/if}
  </div>
</header>

{#if article.main_content}
  <main>
    <div class="container">
      {@html md(article.main_content)}
    </div>
  </main>
{/if}

<Footer {websiteOverview} />
