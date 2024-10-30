<script lang="ts">
  import { type WebsiteOverview } from "../../utils";

  const {
    websiteOverview,
    nestingLevel,
    apiUrl,
    title,
    slug,
    metaDescription,
    websiteUrl
  }: {
    websiteOverview: WebsiteOverview;
    nestingLevel: number;
    apiUrl: string;
    title: string;
    slug?: string;
    metaDescription?: string | null;
    websiteUrl: string;
  } = $props();

  const constructedTitle =
    websiteOverview.title === title ? title : `${websiteOverview.title} | ${title}`;

  let ogUrl = `${websiteUrl.replace(/\/$/, "")}${nestingLevel === 0 ? (websiteOverview.title === title ? "" : `/${slug}`) : `/articles/${slug}`}`;
</script>

<svelte:head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>{constructedTitle}</title>
  <meta name="description" content={metaDescription ?? title} />
  <link rel="stylesheet" href={`${"../".repeat(nestingLevel)}variables.css`} />
  <link rel="stylesheet" href={`${"../".repeat(nestingLevel)}common.css`} />
  <link rel="stylesheet" href={`${"../".repeat(nestingLevel)}scoped.css`} />
  {#if websiteOverview.settings.favicon_image}
    <link
      rel="icon"
      href="{apiUrl}/rpc/retrieve_file?id={websiteOverview.settings.favicon_image}"
    />
  {/if}
  <meta property="og:site_name" content={websiteOverview.title} />
  <meta property="og:title" content={constructedTitle} />
  <meta property="og:description" content={metaDescription ?? title} />
  <meta property="og:type" content="article" />
  <meta property="og:url" content={ogUrl} />
  {#if websiteOverview.header.logo_image}
    <meta
      property="og:image"
      content="{apiUrl}/rpc/retrieve_file?id={websiteOverview.header.logo_image}"
    />
  {/if}
  <script>
    const determineTheme = (skipSetTheme = false) => {
      const lightMode = window
        .getComputedStyle(document.documentElement)
        .getPropertyValue("--display-light");
      const darkMode = window
        .getComputedStyle(document.documentElement)
        .getPropertyValue("--display-dark");

      if (!skipSetTheme && lightMode === "none") {
        localStorage.setItem("theme", "light");
      }

      if (!skipSetTheme && darkMode === "none") {
        localStorage.setItem("theme", "dark");
      }

      const currentTheme = localStorage.getItem("theme");

      window.addEventListener("DOMContentLoaded", (event) => {
        const prefersDarkScheme = window.matchMedia("(prefers-color-scheme: dark)");

        document.querySelector("#toggle-theme").checked =
          darkMode === "none" ? currentTheme === "light" : currentTheme === "dark";
      });
    };

    determineTheme(true);

    window.addEventListener("DOMContentLoaded", (event) => {
      document.querySelector('label[for="toggle-theme"]').addEventListener("click", () => {
        determineTheme();
      });
    });
  </script>
</svelte:head>
