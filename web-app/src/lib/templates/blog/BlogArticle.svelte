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
    <link
      rel="stylesheet"
      media="(prefers-color-scheme: light)"
      href="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.10.0/styles/github.min.css"
      integrity="sha512-0aPQyyeZrWj9sCA46UlmWgKOP0mUipLQ6OZXu8l4IcAmD2u31EPEy9VcIMvl7SoAaKe8bLXZhYoMaE/in+gcgA=="
      crossorigin="anonymous"
      referrerpolicy="no-referrer"
    />
    <link
      rel="stylesheet"
      media="(prefers-color-scheme: dark)"
      href="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.10.0/styles/github-dark.min.css"
      integrity="sha512-rO+olRTkcf304DQBxSWxln8JXCzTHlKnIdnMUwYvQa9/Jd4cQaNkItIUj6Z4nvW1dqK0SKXLbn9h4KwZTNtAyw=="
      crossorigin="anonymous"
      referrerpolicy="no-referrer"
    />
    <title>{title}</title>
    <link rel="stylesheet" href="../styles.css" />
  </head>
</svelte:head>

<nav>
  <div class="container">
    <a href="../">
      {#if logoType === "text"}
        <p>
          <strong>{logo}</strong>
        </p>
      {:else}
        <img src={logo} alt="" />
      {/if}
    </a>
  </div>
</nav>

<header>
  <div class="container">
    <hgroup>
      <p>{publicationDate}</p>
      <h1>{title}</h1>
    </hgroup>
    {#if coverImage}
      <img src={coverImage} alt="" />
    {/if}
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
