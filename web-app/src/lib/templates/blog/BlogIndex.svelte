<script lang="ts">
  import Head from "../common/Head.svelte";
  import Nav from "../common/Nav.svelte";
  import Footer from "../common/Footer.svelte";
  import { md, slugify, type WebsiteOverview } from "$lib/utils";

  const {
    websiteOverview,
    apiUrl,
    isLegalPage,
    websiteUrl
  }: {
    websiteOverview: WebsiteOverview;
    apiUrl: string;
    isLegalPage: boolean;
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
  title={isLegalPage ? "Legal information" : websiteOverview.title}
  metaDescription={websiteOverview.home.meta_description}
  {websiteUrl}
/>

<Nav {websiteOverview} isDocsTemplate={false} isIndexPage={true} {apiUrl} />

<header>
  <div class="container">
    <h1>{isLegalPage ? "Legal information" : websiteOverview.title}</h1>
  </div>
</header>

<main>
  <div class="container">
    {@html md(
      isLegalPage
        ? (websiteOverview.legal_information?.main_content ?? "")
        : websiteOverview.home.main_content,
      false
    )}
    {#if websiteOverview.article.length > 0 && !isLegalPage}
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
                  <a href="./articles/{slugify(article.title)}">{article.title}</a>
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

<Footer {websiteOverview} isIndexPage={true} />
