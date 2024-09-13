<script lang="ts">
  import Head from "../common/Head.svelte";
  import Nav from "../common/Nav.svelte";
  import Footer from "../common/Footer.svelte";
  import { md, type WebsiteOverview } from "../../utils";

  const {
    websiteOverview,
    apiUrl,
    isLegalPage
  }: { websiteOverview: WebsiteOverview; apiUrl: string; isLegalPage: boolean } = $props();
</script>

<Head
  {websiteOverview}
  nestingLevel={0}
  {apiUrl}
  title={isLegalPage ? "Legal information" : websiteOverview.title}
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
          {#each websiteOverview.article as article}
            {@const articleFileName = article.title.toLowerCase().split(" ").join("-")}
            <li>
              {#if article.publication_date}
                <p>{article.publication_date}</p>
              {/if}
              <p>
                <strong>
                  <a href="./articles/{articleFileName}">{article.title}</a>
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
