<script lang="ts">
  import { page } from "$app/stores";
  import { PAGINATION_MAX_ITEMS } from "$lib/utils";

  const { commonFilters = [], resultCount }: { commonFilters?: string[]; resultCount: number } =
    $props();
</script>

<div class="pagination">
  {#snippet commonFilterInputs()}
    {#each commonFilters as filter (filter)}
      <input type="hidden" name={filter} value={$page.url.searchParams.get(filter)} />
    {/each}
  {/snippet}
  <p>
    {$page.url.searchParams.get("page") ?? 1} / {Math.max(
      Math.ceil(resultCount / PAGINATION_MAX_ITEMS),
      1
    )}
  </p>
  <form method="GET">
    <input type="hidden" name="page" value={1} />
    {@render commonFilterInputs()}
    <button type="submit" disabled={($page.url.searchParams.get("page") ?? "1") === "1"}
      >First</button
    >
  </form>
  <form method="GET">
    <input
      type="hidden"
      name="page"
      value={Math.max(1, Number.parseInt($page.url.searchParams.get("page") ?? "1") - 1)}
    />
    {@render commonFilterInputs()}
    <button type="submit" disabled={($page.url.searchParams.get("page") ?? "1") === "1"}
      >Previous</button
    >
  </form>
  <form method="GET">
    <input
      type="hidden"
      name="page"
      value={Math.min(
        Math.max(Math.ceil(resultCount / PAGINATION_MAX_ITEMS), 1),
        Number.parseInt($page.url.searchParams.get("page") ?? "1") + 1
      )}
    />
    {@render commonFilterInputs()}
    <button
      type="submit"
      disabled={($page.url.searchParams.get("page") ?? "1") ===
        Math.max(Math.ceil(resultCount / PAGINATION_MAX_ITEMS), 1).toString()}>Next</button
    >
  </form>
  <form method="GET">
    <input
      type="hidden"
      name="page"
      value={Math.max(Math.ceil(resultCount / PAGINATION_MAX_ITEMS), 1)}
    />
    {@render commonFilterInputs()}
    <button
      type="submit"
      disabled={($page.url.searchParams.get("page") ?? "1") ===
        Math.max(Math.ceil(resultCount / PAGINATION_MAX_ITEMS), 1).toString()}>Last</button
    >
  </form>
</div>

<style>
  .pagination {
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    gap: var(--space-xs);
    justify-content: end;
  }

  .pagination > form:first-of-type {
    margin-inline-start: auto;
  }
</style>
