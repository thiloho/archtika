<script lang="ts">
  import Head from "../common/Head.svelte";
  import Nav from "../common/Nav.svelte";
  import Footer from "../common/Footer.svelte";
  import { md, type WebsiteOverview } from "../../utils";
  import type { Article } from "../../db-schema";

  const {
    websiteOverview,
    article,
    apiUrl,
    websiteUrl
  }: { websiteOverview: WebsiteOverview; article: Article; apiUrl: string; websiteUrl: string } =
    $props();
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

<Nav {websiteOverview} isDocsTemplate={true} isIndexPage={false} {apiUrl} />

<header>
  <div class="container">
    <h1>{article.title}</h1>
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
