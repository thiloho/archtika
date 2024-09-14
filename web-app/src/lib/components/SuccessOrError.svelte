<script lang="ts">
  const { success, message }: { success?: boolean; message?: string } = $props();
</script>

{#if success}
  <p class="toast success">{message}</p>
{/if}

{#if success === false}
  <p class="toast error">{message}</p>
{/if}

<style>
  .toast {
    position: fixed;
    inset-block-end: var(--space-s);
    inset-inline-end: var(--space-s);
    margin-inline-start: var(--space-s);
    padding-inline: var(--space-xs);
    padding-block: var(--space-2xs);
    text-align: center;
    border-radius: var(--border-radius);
    color: var(--color-text-invert);
    z-index: 30;
    animation: toast 3s forwards;
  }

  .success {
    background-color: var(--color-success);
  }

  .error {
    background-color: var(--color-error);
  }

  @keyframes toast {
    0%,
    90% {
      opacity: 1;
    }
    100% {
      opacity: 0;
    }
  }
</style>
