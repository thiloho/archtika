<script lang="ts">
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

<svelte:head>
  <head>
    <title>{title}</title>
    <link rel="stylesheet" href="./styles.css" />
  </head>
</svelte:head>

<nav>
  {#if logoType === "text"}
    <p>
      <strong>{logo}</strong>
    </p>
  {:else}
    <img src={logo} alt="" />
  {/if}
</nav>

<header>
  <h1>{title}</h1>
</header>

<main>
  <section>
    {@html mainContent}
  </section>
  {#if articles.length > 0}
    <section>
      <h2>Articles</h2>

      {#each articles as article}
        {@const articleFileName = article.title.toLowerCase().split(" ").join("-")}

        <article>
          <p>{article.publication_date}</p>
          <h3>
            <a href="./documents/{articleFileName}.html">{article.title}</a>
          </h3>
          {#if article.meta_description}
            <p>{article.meta_description}</p>
          {/if}
        </article>
      {/each}
    </section>
  {/if}
</main>

<footer>
  {footerAdditionalText}
</footer>
