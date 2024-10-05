<div class="spinner"></div>

<style>
  @keyframes spinner {
    to {
      transform: rotate(360deg);
    }
  }

  .spinner {
    position: fixed;
    inset: 0;
    background-color: var(--bg-blurred);
    z-index: 40;
  }

  .spinner::before {
    content: "";
    position: absolute;
    inline-size: 4rem;
    block-size: 4rem;
    inset-block-start: 50%;
    inset-inline-start: 50%;
    margin-block-start: -2rem;
    margin-inline-start: -2rem;
    border-radius: 50%;
    border: var(--border-primary);
    border-width: 0.25rem;
    border-block-start-color: var(--color-accent);
    animation: spinner 500ms linear infinite;
  }
</style>
