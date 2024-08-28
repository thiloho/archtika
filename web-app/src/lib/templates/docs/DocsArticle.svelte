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
    categorizedArticles,
    coverImage,
    publicationDate,
    footerAdditionalText
  }: {
    favicon: string;
    title: string;
    logoType: "text" | "image";
    logo: string;
    mainContent: string;
    categorizedArticles: { [key: string]: { title: string }[] };
    coverImage: string;
    publicationDate: string;
    footerAdditionalText: string;
  } = $props();
</script>

<Head {title} {favicon} nestingLevel={1} />

<Nav {logoType} {logo} isDocsTemplate={true} {categorizedArticles} isIndexPage={false} />

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

<Footer text={footerAdditionalText} />
