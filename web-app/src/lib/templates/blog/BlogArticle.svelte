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
    <title>{title}</title>
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
  <img src={coverImage} alt="" />
  <h1>{title}</h1>
  <p>{publicationDate}</p>
</header>

<main>
  {@html mainContent}
</main>

<footer>
  {footerAdditionalText}
</footer>
