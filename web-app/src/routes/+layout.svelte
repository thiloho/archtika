<script lang="ts">
  import "../../template-styles/variables.css";
  import "../../template-styles/common-styles.css";
  import { page } from "$app/stores";
  import type { LayoutServerData } from "./$types";
  import type { Snippet } from "svelte";
  import { navigating } from "$app/stores";
  import LoadingSpinner from "$lib/components/LoadingSpinner.svelte";
  import { LOADING_DELAY } from "$lib/utils";

  const { data, children }: { data: LayoutServerData; children: Snippet } = $props();

  const isProjectRoute = $derived($page.url.pathname.startsWith("/website") && !$page.error);
  const routeName = $derived(
    $page.url.pathname === "/"
      ? "Dashboard"
      : `${$page.url.pathname.charAt(1).toUpperCase()}${$page.url.pathname.slice(2)}`
  );

  let loading = $state(false);
  let loadingDelay: number;

  $effect(() => {
    if ($navigating) {
      loadingDelay = window.setTimeout(() => (loading = true), LOADING_DELAY);
    } else {
      window.clearTimeout(loadingDelay);
      loading = false;
    }
  });
</script>

{#if loading}
  <LoadingSpinner />
{/if}

<svelte:head>
  <title>archtika | {routeName.replaceAll("/", " - ")}</title>
  <meta
    name="description"
    content="FLOSS, modern, performant and lightweight CMS (Content Mangement System) with predefined templates"
  />
</svelte:head>

<nav>
  {#if data.user}
    <div class="logo-wrapper">
      <img src="/favicon.svg" width="24" height="24" alt="" />
      <a href="/">archtika</a>
    </div>
  {:else}
    <img src="/favicon.svg" width="24" height="24" alt="" />
  {/if}
  <ul class="link-wrapper unpadded">
    {#if data.user}
      {#if data.user.user_role === "administrator"}
        <li>
          <a href="/manage">Manage</a>
        </li>
      {/if}
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

{#if !isProjectRoute && !$page.error}
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
      >Copyright &copy; {new Date().getFullYear()} &mdash;
      <a href="https://archtika.com">archtika</a></small
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

  nav > .logo-wrapper {
    display: flex;
    align-items: center;
    gap: var(--space-2xs);
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
