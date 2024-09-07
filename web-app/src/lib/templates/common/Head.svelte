<script lang="ts">
  const {
    title,
    favicon,
    nestingLevel = 0,
    metaDescription = null
  }: {
    title: string;
    favicon: string;
    nestingLevel?: number;
    metaDescription: string | null;
  } = $props();
</script>

<svelte:head>
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>{title}</title>
    <meta name="description" content={metaDescription ?? title} />
    <link rel="stylesheet" href={`${"../".repeat(nestingLevel)}styles.css`} />
    {#if favicon}
      <link rel="icon" href={favicon} />
    {/if}
  </head>
</svelte:head>
