<script lang="ts">
  import type { Snippet } from "svelte";

  const { children, id, text } = $props<{ children: Snippet; id: string; text: string }>();
</script>

<a href={`#${id}`} role="button">{text}</a>

<div {id} class="modal">
  <div class="modal__content">
    {@render children()}
    <a href="#!" role="button">Close</a>
  </div>
  <a href="#!" class="modal__closeoverlay" aria-label="Close modal"></a>
</div>

<style>
  .modal {
    position: fixed;
    inset: 0;
    display: none;
  }

  .modal:target {
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 1rem;
  }

  .modal__closeoverlay {
    position: fixed;
    inset: 0;
    z-index: 10;
    background-color: rgba(0, 0, 0, 0.5);
  }

  .modal__content {
    display: flex;
    flex-direction: column;
    gap: 2rem;
    padding-inline: 1rem;
    padding-block: 2rem;
    background-color: var(--bg-primary);
    border-radius: var(--border-radius);
    border: var(--border-primary);
    inline-size: 300px;
    max-inline-size: 100%;
    max-block-size: calc(100vh - 2rem);
    overflow-y: auto;
    z-index: 20;
  }
</style>
