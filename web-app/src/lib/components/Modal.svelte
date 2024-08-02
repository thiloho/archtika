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
    display: block;
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
    z-index: 20;
    position: absolute;
    max-inline-size: 300px;
    margin-inline: auto;
    inset-block-start: 2rem;
    inset-inline-start: 50%;
    transform: translateX(-50%);
  }
</style>
