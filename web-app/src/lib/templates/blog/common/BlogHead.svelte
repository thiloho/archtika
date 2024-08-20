<script lang="ts">
  const { title, nestingLevel = 0 }: { title: string; nestingLevel?: number } = $props();
</script>

<svelte:head>
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>{title}</title>
    <link rel="stylesheet" href={`${"../".repeat(nestingLevel)}styles.css`} />
  </head>
</svelte:head>
