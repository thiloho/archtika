<script lang="ts">
  import "../app.css";
  import { page } from "$app/stores";
  import type { LayoutServerData } from "./$types";
  import type { Snippet } from "svelte";

  const { data, children } = $props<{ data: LayoutServerData; children: Snippet }>();

  const isProjectRoute = $derived($page.url.pathname.startsWith("/website"));
  const routeName = $derived(
    $page.url.pathname === "/"
      ? "Dashboard"
      : `${$page.url.pathname.charAt(1).toUpperCase()}${$page.url.pathname.slice(2)}`
  );
</script>

<svelte:head>
  <title>archtika | {routeName.replaceAll("/", " - ")}</title>
</svelte:head>

<nav>
  <img src="/favicon.svg" width="24" height="24" alt="" />
  <ul class="link-wrapper">
    {#if data.user}
      <li>
        <a href="/">Dashboard</a>
      </li>
      <li>
        <a href="/account">Account</a>
      </li>
    {:else}
      <li>
        <a href="/register">Register</a>
      </li>
      <li>
        <a href="/login">Login</a>
      </li>
    {/if}
  </ul>
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
    <small
      >&copy; {new Date().getFullYear()} &mdash; <a href="https://archtika.com">archtika</a></small
    >
  </p>
</footer>

<style>
  nav,
  header,
  main,
  footer {
    padding-block: var(--space-s);
    inline-size: min(100% - var(--space-m), 1024px);
    margin-inline: auto;
  }

  nav {
    display: flex;
    align-items: center;
    column-gap: var(--space-m);
    row-gap: var(--space-3xs);
    flex-wrap: wrap;
    justify-content: space-between;
  }

  nav > .link-wrapper {
    display: flex;
    align-items: center;
    gap: var(--space-s);
  }

  footer {
    text-align: center;
    margin-block-start: auto;
  }

  .editor {
    display: grid;
    block-size: calc(100vh - (4 * var(--space-s) + 2 * 1.5rem));
    inline-size: min(100% - var(--space-m), 1536px);
    border-block-start: var(--border-primary);
    padding-block: 0;
    position: relative;
  }

  @media (min-width: 640px) {
    .editor {
      grid-template-columns: 1fr 1fr;
    }
  }
</style>
