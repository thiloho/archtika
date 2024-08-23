<script lang="ts">
  import BlogHead from "./common/BlogHead.svelte";
  import BlogNav from "./common/BlogNav.svelte";
  import BlogFooter from "./common/BlogFooter.svelte";

  const {
    title,
    logoType,
    logo,
    mainContent,
    articles,
    footerAdditionalText
  }: {
    title: string;
    logoType: "text" | "image";
    logo: string;
    mainContent: string;
    articles: { title: string; publication_date: string; meta_description: string }[];
    footerAdditionalText: string;
  } = $props();
</script>

<BlogHead {title} />

<BlogNav {logoType} {logo} />

<header>
  <div class="container">
    <h1>{title}</h1>
  </div>
</header>

<main>
  <div class="container">
    {@html mainContent}
    {#if articles.length > 0}
      <section class="articles">
        <h2>Articles</h2>

        <ul class="unpadded">
          {#each articles as article}
            {@const articleFileName = article.title.toLowerCase().split(" ").join("-")}
            <li>
              <p>{article.publication_date}</p>
              <p>
                <strong>
                  <a href="./articles/{articleFileName}.html">{article.title}</a>
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

<BlogFooter text={footerAdditionalText} />
