<script lang="ts">
  import Head from "../common/Head.svelte";
  import Nav from "../common/Nav.svelte";
  import Footer from "../common/Footer.svelte";

  const {
    favicon,
    title,
    logoType,
    logo,
    mainContent,
    articles,
    footerAdditionalText
  }: {
    favicon: string;
    title: string;
    logoType: "text" | "image";
    logo: string;
    mainContent: string;
    articles: { title: string; publication_date: string; meta_description: string }[];
    footerAdditionalText: string;
  } = $props();
</script>

<Head {title} {favicon} />

<Nav {logoType} {logo} />

<header>
  <div class="container">
    <h1>{title}</h1>
  </div>
</header>

<main>
  <div class="container">
    {@html mainContent}
    {#if articles.length > 0}
      <section class="articles" id="articles">
        <h2>
          <a href="#articles">Articles</a>
        </h2>

        <ul class="unpadded">
          {#each articles as article}
            {@const articleFileName = article.title.toLowerCase().split(" ").join("-")}
            <li>
              <p>{article.publication_date}</p>
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

<Footer text={footerAdditionalText} />
