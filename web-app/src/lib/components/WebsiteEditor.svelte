<script lang="ts">
  import type { Snippet } from "svelte";
  import { md } from "$lib/utils";
  import { page } from "$app/stores";
  import { previewContent, textareaScrollTop } from "$lib/runes.svelte";

  const {
    id,
    contentType,
    title,
    children,
    fullPreview = false
  }: {
    id: string;
    contentType: string;
    title: string;
    children: Snippet;
    fullPreview?: boolean;
  } = $props();

  let previewElement: HTMLDivElement;

  $effect(() => {
    const scrollHeight = previewElement.scrollHeight - previewElement.clientHeight;
    previewElement.scrollTop = (textareaScrollTop.value / 100) * scrollHeight;
  });

  const tabs = ["settings", "articles", "categories", "collaborators", "publish", "logs"];

  let iframeLoaded = $state(false);
</script>

<input type="checkbox" id="toggle-mobile-preview" hidden />
<label for="toggle-mobile-preview">Preview</label>

<div class="operations">
  <h1>{title}</h1>

  <nav class="operations__nav">
    <ul class="unpadded">
      {#each tabs.filter((tab) => (tab !== "categories" && contentType === "Blog") || contentType === "Docs") as tab}
        <li>
          <a
            href="/website/{id}{tab === 'settings' ? '' : `/${tab}`}"
            class:active={tab === "settings"
              ? $page.url.pathname === `/website/${id}`
              : $page.url.pathname.includes(tab)}
            >{(tab.charAt(0).toUpperCase() + tab.slice(1)).replace("-", " ") || "Settings"}</a
          >
        </li>
      {/each}
    </ul>
  </nav>

  {@render children()}
</div>

<div class="preview" bind:this={previewElement}>
  {#if fullPreview}
    {#if !iframeLoaded}
      <p>Loading preview...</p>
    {/if}
    <iframe
      src={previewContent.value}
      title="Preview"
      onload={() => (iframeLoaded = true)}
      style:display={iframeLoaded ? "block" : "none"}
    ></iframe>
  {:else}
    {@html md(
      previewContent.value || "Write some markdown content to see a live preview here",
      Object.keys($page.params).length > 1 ? true : false
    )}
  {/if}
</div>

<style>
  label[for="toggle-mobile-preview"] {
    position: absolute;
    inset-block-start: -0.0625rem;
    inset-inline-start: 50%;
    transform: translateX(-50%);
    display: flex;
    gap: var(--space-2xs);
  }

  #toggle-mobile-preview:checked ~ .operations {
    display: none;
  }

  #toggle-mobile-preview:checked ~ .preview {
    display: flex;
  }

  .operations,
  .preview {
    padding: var(--space-s);
    padding-block-start: var(--space-xl);
    overflow-y: auto;
  }

  .operations__nav > ul {
    margin-block: var(--space-s) var(--space-m);
    display: flex;
    flex-wrap: wrap;
    column-gap: var(--space-s);
    row-gap: var(--space-3xs);
  }

  iframe {
    inline-size: 100%;
    block-size: 100%;
    border: var(--border-primary);
  }

  .preview {
    display: none;
    flex-direction: column;
    gap: var(--space-s);
  }

  .active {
    text-underline-offset: 0.375rem;
    text-decoration-thickness: 0.25rem;
  }

  @media (min-width: 640px) {
    label[for="toggle-mobile-preview"] {
      display: none;
    }

    .operations {
      padding-block-start: var(--space-s);
    }

    .preview {
      display: flex;
      padding-block-start: var(--space-s);
      border-inline-start: var(--border-primary);
    }
  }
</style>
