<script lang="ts">
  import { page } from "$app/stores";
  const { data, children } = $props();
</script>

<nav>
  <a href="/">archtika</a>
  {#if data.user}
    <a href="/account">Account</a>
  {:else}
    <a href="/register">Register</a>
    <a href="/login">Login</a>
  {/if}
</nav>

<header>
  <h1>{$page.url.pathname}</h1>
</header>

<main>
  {@render children()}
</main>

<footer>
  <p>
    <small>archtika</small>
  </p>
</footer>
