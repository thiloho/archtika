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
    categorizedArticles,
    footerAdditionalText
  }: {
    favicon: string;
    title: string;
    logoType: "text" | "image";
    logo: string;
    mainContent: string;
    articles: { title: string; publication_date: string; meta_description: string }[];
    categorizedArticles: { [key: string]: { title: string }[] };
    footerAdditionalText: string;
  } = $props();
</script>

<Head {title} {favicon} />

<Nav {logoType} {logo} isDocsTemplate={true} {categorizedArticles} />

<header>
  <div class="container">
    <h1>{title}</h1>
  </div>
</header>

<main>
  <div class="container">
    {@html mainContent}
  </div>
</main>

<Footer text={footerAdditionalText} />
