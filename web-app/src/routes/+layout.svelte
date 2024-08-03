<script lang="ts">
  import "../app.css";
  import { page } from "$app/stores";
  const { data, children } = $props();

  const isProjectRoute = $derived($page.url.pathname.startsWith("/website"));
  const routeName = $derived(
    $page.url.pathname === "/"
      ? "Dashboard"
      : `${$page.url.pathname.charAt(1).toUpperCase()}${$page.url.pathname.slice(2)}`
  );
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
    <h1>{routeName}</h1>
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

  nav {
    display: flex;
    align-items: center;
    gap: 1rem;
    overflow-x: auto;
  }

  nav > *:first-child {
    margin-inline-end: auto;
  }

  footer {
    text-align: center;
    margin-block-start: auto;
  }

  .editor {
    inline-size: min(100% - 2rem, 1536px);
    block-size: calc(100vh - 7rem);
    border-block-start: var(--border-primary);
    display: grid;
    grid-template-columns: 1fr 1fr;
    padding-block: 0;
  }
</style>
