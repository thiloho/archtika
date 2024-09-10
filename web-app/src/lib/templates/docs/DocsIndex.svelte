<script lang="ts">
  import Head from "../common/Head.svelte";
  import Nav from "../common/Nav.svelte";
  import Footer from "../common/Footer.svelte";
  import { md, type WebsiteOverview } from "../../utils";

  const {
    websiteOverview,
    apiUrl,
    isLegalPage
  }: { websiteOverview: WebsiteOverview; apiUrl: string; isLegalPage: boolean } = $props();
</script>

<Head
  {websiteOverview}
  nestingLevel={0}
  {apiUrl}
  title={isLegalPage ? "Legal information" : websiteOverview.title}
/>

<Nav {websiteOverview} isDocsTemplate={true} isIndexPage={true} {apiUrl} />

<header>
  <div class="container">
    <h1>{isLegalPage ? "Legal information" : websiteOverview.title}</h1>
  </div>
</header>

<main>
  <div class="container">
    {@html md(
      isLegalPage
        ? (websiteOverview.legal_information?.main_content ?? "")
        : websiteOverview.home.main_content,
      false
    )}
  </div>
</main>

<Footer {websiteOverview} isIndexPage={true} />
