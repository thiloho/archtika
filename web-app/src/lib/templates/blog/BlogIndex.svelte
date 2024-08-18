<script lang="ts">
  const { title, logoType, logo, mainContent, articles, footerAdditionalText } = $props<{
    title: string;
    logoType: "text" | "image";
    logo: string;
    mainContent: string;
    articles: any[];
    footerAdditionalText: string;
  }>();
</script>

<svelte:head>
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>{title}</title>
    <link rel="stylesheet" href="./styles.css" />
  </head>
</svelte:head>

<nav>
  <div class="container">
    {#if logoType === "text"}
      <p>
        <strong>{logo}</strong>
      </p>
    {:else}
      <img src={logo} alt="" />
    {/if}
  </div>
</nav>

<header>
  <div class="container">
    <h1>{title}</h1>
  </div>
</header>

<main>
  <div class="container">
    {@html mainContent}
    {#if articles.length > 0}
      <section>
        <h2>Articles</h2>

        {#each articles as article}
          {@const articleFileName = article.title.toLowerCase().split(" ").join("-")}

          <article>
            <p>{article.publication_date}</p>
            <h3>
              <a href="./articles/{articleFileName}.html">{article.title}</a>
            </h3>
            {#if article.meta_description}
              <p>{article.meta_description}</p>
            {/if}
          </article>
        {/each}
      </section>
    {/if}
  </div>
</main>

<footer>
  <div class="container">
    {footerAdditionalText}
  </div>
</footer>
