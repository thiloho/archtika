<script lang="ts">
  import type { Snippet } from "svelte";
  import { md } from "$lib/utils";

  const {
    id,
    title,
    children,
    fullPreview = false,
    previewContent
  } = $props<{
    id: string;
    title: string;
    children: Snippet;
    fullPreview?: boolean;
    previewContent: string;
  }>();
</script>

<div class="operations">
  <h1>{title}</h1>

  <nav class="operations__nav">
    <a href="/website/{id}">Settings</a>
    <a href="/website/{id}/articles">Articles</a>
    <a href="/website/{id}/collaborators">Collaborators</a>
    <a href="/website/{id}/publish">Publish</a>
  </nav>

  {@render children()}
</div>

<div class="preview">
  {#if fullPreview}
    <iframe
      src="http://localhost:5173/user-websites/e6710116-f2b7-4318-82de-35a25d22ed2e/0015130f-3024-402b-8421-aaee4a6f0890/index.html"
      title="Preview"
    ></iframe>
  {:else}
    {@html md.render(previewContent)}
  {/if}
</div>

<style>
  .operations,
  .preview {
    padding: 1rem;
    overflow-y: auto;
  }

  .operations {
    border-inline-end: var(--border-primary);
  }

  .operations__nav {
    margin-block: 1rem 2rem;
    display: flex;
    gap: 1rem;
    overflow-x: auto;
  }

  .preview {
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  iframe {
    inline-size: 100%;
    block-size: 100%;
    border: var(--border-primary);
  }
</style>
