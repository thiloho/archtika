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

  <div>
    <a href="/website/{id}">Settings</a>
    <a href="/website/{id}/articles">Articles</a>
  </div>

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
    border-inline-end: 0.0625rem solid hsl(0 0% 50%);
    resize: horizontal;
    overflow-y: auto;
  }

  .preview {
    flex-grow: 1;
  }
</style>
