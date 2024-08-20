<script lang="ts">
  const {
    title,
    logoType,
    logo,
    mainContent,
    coverImage,
    publicationDate,
    footerAdditionalText
  }: {
    title: string;
    logoType: "text" | "image";
    logo: string;
    mainContent: string;
    coverImage: string;
    publicationDate: string;
    footerAdditionalText: string;
  } = $props();
</script>

<svelte:head>
  <head>
    <title>{title}</title>
    <link rel="stylesheet" href="../styles.css" />
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
  {#if coverImage}
    <img src={coverImage} alt="" />
  {/if}
  <h1>{title}</h1>
  <p>{publicationDate}</p>
</header>

<main>
  {@html mainContent}
</main>

<footer>
  {footerAdditionalText}
</footer>
