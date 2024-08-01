<script lang="ts">
  import { enhance } from "$app/forms";
  import DateTime from "$lib/components/DateTime.svelte";
  import { sortOptions } from "$lib/utils.js";
  import { page } from "$app/stores";

  const { form, data } = $props();
</script>

{#if form?.success}
  <p>{form.message}</p>
{/if}

{#if form?.success === false}
  <p>{form.message}</p>
{/if}

<section>
  <h2>Create website</h2>

  <form method="POST" action="?/createWebsite" use:enhance>
    <label>
      Type:
      <select name="content-type">
        <option value="Blog">Blog</option>
        <option value="Docs">Docs</option>
      </select>
    </label>
    <label>
      Title:
      <input type="text" name="title" />
    </label>

    <button type="submit">Submit</button>
  </form>
</section>

{#if data.totalWebsiteCount > 0}
  <section>
    <h2>All websites</h2>

    <form method="GET">
      <label>
        Search:
        <input
          type="text"
          name="website_search_query"
          value={$page.url.searchParams.get("website_search_query")}
        />
      </label>
      <label>
        Sort:
        <select name="website_sort">
          {#each sortOptions as { value, text }}
            <option {value} selected={value === $page.url.searchParams.get("website_sort")}
              >{text}</option
            >
          {/each}
        </select>
      </label>
      <label>
        Filter:
        <select name="website_filter">
          <option value="all">Show all</option>
          <option value="creations">Created by you</option>
          <option value="shared">Shared with you</option>
        </select>
      </label>
      <button type="submit">Submit</button>
    </form>

    {#each data.websites as { id, content_type, title, created_at }}
      <article>
        <h3>
          <a href="/website/{id}">{title}</a>
        </h3>
        <p>
          <strong>Type:</strong>
          {content_type}
        </p>
        <p>
          <strong>Created at:</strong>
          <DateTime date={created_at} />
        </p>
        <details>
          <summary>Update</summary>
          <form
            method="POST"
            action="?/updateWebsite"
            use:enhance={() => {
              return async ({ update }) => {
                await update({ reset: false });
              };
            }}
          >
            <input type="hidden" name="id" value={id} />
            <label>
              Title
              <input type="text" name="title" value={title} />
            </label>

            <button type="submit">Submit</button>
          </form>
        </details>
        <details>
          <summary>Delete</summary>
          <p>
            <strong>Caution!</strong>
            Deleting this website will irretrievably erase all data.
          </p>
          <form method="POST" action="?/deleteWebsite" use:enhance>
            <input type="hidden" name="id" value={id} />

            <button type="submit">Permanently delete website</button>
          </form>
        </details>
      </article>
    {/each}
  </section>
{/if}
