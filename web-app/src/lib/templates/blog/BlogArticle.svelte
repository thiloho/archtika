<script lang="ts">
  import Head from "../common/Head.svelte";
  import Nav from "../common/Nav.svelte";
  import Footer from "../common/Footer.svelte";
  import { type WebsiteOverview, md } from "../../utils";
  import type { Article } from "../../db-schema";

  const {
    websiteOverview,
    article,
    apiUrl
  }: { websiteOverview: WebsiteOverview; article: Article; apiUrl: string } = $props();
</script>

<Head
  {websiteOverview}
  nestingLevel={1}
  {apiUrl}
  title={article.title}
  metaDescription={article.meta_description}
/>

<Nav {websiteOverview} isDocsTemplate={false} isIndexPage={false} {apiUrl} />

<header>
  <div class="container">
    <hgroup>
      <p>{article.publication_date}</p>
      <h1>{article.title}</h1>
    </hgroup>
    {#if article.cover_image}
      <img src="{apiUrl}/rpc/retrieve_file?id={article.cover_image}" alt="" />
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

<Footer {websiteOverview} isIndexPage={false} />
