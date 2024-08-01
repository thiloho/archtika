<script lang="ts">
  import { page } from "$app/stores";
  const { data, children } = $props();

  const isProjectRoute = $derived($page.url.pathname.startsWith("/website"));
</script>

<nav>
  <strong>archtika</strong>
  {#if data.user}
    <a href="/">Dashboard</a>
    <a href="/account">Account</a>
  {:else}
    <a href="/register">Register</a>
    <a href="/login">Login</a>
  {/if}
</nav>

{#if !isProjectRoute}
  <header>
    <h1>{$page.url.pathname}</h1>
  </header>
{/if}

<main class:editor={isProjectRoute}>
  {@render children()}
</main>

<footer>
  <p>
    <small>archtika is a free, open, modern, performant and lightweight CMS</small>
  </p>
</footer>

<style>
  nav,
  header,
  main,
  footer {
    padding-block: 1rem;
    inline-size: min(100% - 2rem, 1024px);
    margin-inline: auto;
  }

  footer {
    text-align: center;
  }

  .editor {
    inline-size: min(100% - 2rem, 1536px);
    block-size: calc(100vh - 7rem);
    border: 0.0625rem solid hsl(0 0% 50%);
    overflow-y: auto;
    display: flex;
    padding-block: 0;
  }

  :global(section) {
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  :global(form) {
    display: flex;
    flex-wrap: wrap;
    gap: 1rem;
  }
</style>
