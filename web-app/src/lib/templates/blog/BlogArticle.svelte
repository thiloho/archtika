<script lang="ts">
  import BlogHead from "./common/BlogHead.svelte";
  import BlogNav from "./common/BlogNav.svelte";
  import BlogFooter from "./common/BlogFooter.svelte";

  const {
    favicon,
    title,
    logoType,
    logo,
    mainContent,
    coverImage,
    publicationDate,
    footerAdditionalText
  }: {
    favicon: string;
    title: string;
    logoType: "text" | "image";
    logo: string;
    mainContent: string;
    coverImage: string;
    publicationDate: string;
    footerAdditionalText: string;
  } = $props();
</script>

<BlogHead {title} {favicon} nestingLevel={1} />

<BlogNav {logoType} {logo} />

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

{#if mainContent}
  <main>
    <div class="container">
      {@html mainContent}
    </div>
  </main>
{/if}

<BlogFooter text={footerAdditionalText} />
