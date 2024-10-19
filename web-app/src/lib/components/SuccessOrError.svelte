<script lang="ts">
  const { success, message }: { success?: boolean; message?: string } = $props();
</script>

{#if success}
  <p class="toast success">
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 20 20"
      fill="currentColor"
      width="20"
      height="20"
    >
      <path
        fill-rule="evenodd"
        d="M16.704 4.153a.75.75 0 0 1 .143 1.052l-8 10.5a.75.75 0 0 1-1.127.075l-4.5-4.5a.75.75 0 0 1 1.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 0 1 1.05-.143Z"
        clip-rule="evenodd"
      ></path>
    </svg>
    {message}
  </p>
{/if}

{#if success === false}
  <p class="toast error">
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 20 20"
      fill="currentColor"
      width="20"
      height="20"
    >
      <path
        d="M6.28 5.22a.75.75 0 0 0-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 1 0 1.06 1.06L10 11.06l3.72 3.72a.75.75 0 1 0 1.06-1.06L11.06 10l3.72-3.72a.75.75 0 0 0-1.06-1.06L10 8.94 6.28 5.22Z"
      ></path>
    </svg>
    {message}
  </p>
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
