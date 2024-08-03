<script lang="ts">
  import type { Snippet } from "svelte";
  import markdownit from "markdown-it";
  import hljs from "highlight.js";

  const { id, title, children, previewContent } = $props<{
    id: string;
    title: string;
    children: Snippet;
    previewContent: string;
  }>();

  const md = markdownit({
    linkify: true,
    typographer: true,
    highlight: (str, lang) => {
      if (lang && hljs.getLanguage(lang)) {
        try {
          return hljs.highlight(str, { language: lang }).value;
        } catch (_) {}
      }

      return "";
    }
  });
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
  {@html md.render(previewContent)}
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
  }

  .operations__nav > a {
    display: inline-block;
    padding-inline: 0.5rem;
    padding-block: 0.25rem;
    overflow-x: auto;
  }

  .preview {
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }
</style>
