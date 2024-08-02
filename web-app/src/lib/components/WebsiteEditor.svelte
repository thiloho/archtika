<script lang="ts">
  import type { Snippet } from "svelte";

  const { id, title, children, previewContent } = $props<{
    id: string;
    title: string;
    children: Snippet;
    previewContent: string;
  }>();
</script>

<div class="operations">
  <h1>{title}</h1>

  <nav class="operations__nav">
    <a href="/website/{id}">Settings</a>
    <a href="/website/{id}/articles">Articles</a>
  </nav>

  {@render children()}
</div>

<div class="preview">
  {@html previewContent}
</div>

<style>
  .operations,
  .preview {
    padding: 1rem;
    min-inline-size: 15rem;
    block-size: 100%;
  }

  .operations {
    inline-size: 50%;
    border-inline-end: var(--border-primary);
    resize: horizontal;
    overflow-y: auto;
  }

  .operations__nav {
    margin-block: 1rem 2rem;
  }

  .operations__nav > a {
    display: inline-block;
    padding-inline: 0.5rem;
    padding-block: 0.25rem;
    overflow-x: auto;
  }

  .preview {
    flex-grow: 1;
  }
</style>
