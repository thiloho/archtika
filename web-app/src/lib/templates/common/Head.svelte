<script lang="ts">
  import type { WebsiteOverview } from "../../utils";

  const {
    websiteOverview,
    nestingLevel,
    apiUrl,
    title,
    metaDescription
  }: {
    websiteOverview: WebsiteOverview;
    nestingLevel: number;
    apiUrl: string;
    title: string;
    metaDescription?: string | null;
  } = $props();
</script>

<svelte:head>
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>{title}</title>
    <meta name="description" content={metaDescription ?? title} />
    <link rel="stylesheet" href={`${"../".repeat(nestingLevel)}styles.css`} />
    {#if websiteOverview.settings.favicon_image}
      <link
        rel="icon"
        href="{apiUrl}/rpc/retrieve_file?id={websiteOverview.settings.favicon_image}"
      />
    {/if}
  </head>
</svelte:head>
