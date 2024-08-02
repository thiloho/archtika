<script lang="ts">
  const { success, message } = $props<{
    success: boolean | undefined;
    message: string;
  }>();
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
    inset-block-end: 1rem;
    inset-inline-end: 1rem;
    padding-inline: 1rem;
    padding-block: 0.5rem;
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
