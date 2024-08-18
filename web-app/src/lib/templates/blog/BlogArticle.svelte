<script lang="ts">
  const { title, logoType, logo, mainContent, coverImage, publicationDate, footerAdditionalText } =
    $props<{
      title: string;
      logoType: "text" | "image";
      logo: string;
      mainContent: string;
      coverImage: string;
      publicationDate: string;
      footerAdditionalText: string;
    }>();
</script>

<svelte:head>
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>{title}</title>
    <link rel="stylesheet" href="../styles.css" />
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
    {#if coverImage}
      <img src={coverImage} alt="" />
    {/if}
    <h1>{title}</h1>
    <p>{publicationDate}</p>
  </div>
</header>

<main>
  <div class="container">
    {@html mainContent}
  </div>
</main>

<footer>
  <div class="container">
    {footerAdditionalText}
  </div>
</footer>
