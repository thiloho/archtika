<script lang="ts">
  import WebsiteEditor from "$lib/components/WebsiteEditor.svelte";
  import { sortOptions } from "$lib/utils.js";
  import { page } from "$app/stores";
  import { enhance } from "$app/forms";

  const { data, form } = $props();
</script>

{#if form?.success}
  <p>{form.message}</p>
{/if}

{#if form?.success === false}
  <p>{form.message}</p>
{/if}

<WebsiteEditor
  id={data.website.id}
  title={data.website.title}
  previewContent={data.home.main_content}
>
  <section>
    <h2>Create article</h2>

    <form method="POST" action="?/createArticle" use:enhance>
      <label>
        Title:
        <input type="text" name="title" />
      </label>

      <button type="submit">Submit</button>
    </form>
  </section>

  {#if data.totalArticleCount > 0}
    <section>
      <h2>All articles</h2>

      <form method="GET">
        <label>
          Search:
          <input
            type="text"
            name="article_search_query"
            value={$page.url.searchParams.get("article_search_query")}
          />
        </label>
        <label>
          Sort:
          <select name="article_sort">
            {#each sortOptions as { value, text }}
              <option {value} selected={value === $page.url.searchParams.get("article_sort")}
                >{text}</option
              >
            {/each}
          </select>
        </label>
        <button type="submit">Submit</button>
      </form>

      {#each data.articles as { id, title }}
        <article>
          <h3>{title}</h3>
          <a href="/website/{data.website.id}/articles/{id}">Edit</a>
          <details>
            <summary>Delete</summary>
            <p>
              <strong>Caution!</strong>
              Deleting this article will irretrievably erase all data.
            </p>
            <form method="POST" action="?/deleteArticle" use:enhance>
              <input type="hidden" name="id" value={id} />

              <button type="submit">Permanently delete article</button>
            </form>
          </details>
        </article>
      {/each}
    </section>
  {/if}
</WebsiteEditor>
