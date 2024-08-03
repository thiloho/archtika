<script lang="ts">
  import WebsiteEditor from "$lib/components/WebsiteEditor.svelte";
  import { sortOptions } from "$lib/utils.js";
  import { page } from "$app/stores";
  import { enhance } from "$app/forms";
  import Modal from "$lib/components/Modal.svelte";
  import SuccessOrError from "$lib/components/SuccessOrError.svelte";

  const { data, form } = $props();
</script>

<SuccessOrError success={form?.success} message={form?.message} />

<WebsiteEditor
  id={data.website.id}
  title={data.website.title}
  previewContent={data.home.main_content}
>
  <section>
    <h2>Create article</h2>

    <Modal id="create-article" text="Create article">
      <h3>Create article</h3>

      <form
        method="POST"
        action="?/createArticle"
        use:enhance={() => {
          return async ({ update }) => {
            await update();
            window.location.hash = "!";
          };
        }}
      >
        <label>
          Title:
          <input type="text" name="title" />
        </label>

        <button type="submit">Submit</button>
      </form>
    </Modal>
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

      {#each data.articles as { id, title } (id)}
        <article class="article-card">
          <h3>{title}</h3>

          <div class="article-card__actions">
            <a href="/website/{data.website.id}/articles/{id}">Edit</a>
            <Modal id="delete-article-{id}" text="Delete">
              <h4>Delete article</h4>

              <p>
                <strong>Caution!</strong>
                Deleting this article will irretrievably erase all data.
              </p>

              <form
                method="POST"
                action="?/deleteArticle"
                use:enhance={() => {
                  return async ({ update }) => {
                    await update();
                    window.location.hash = "!";
                  };
                }}
              >
                <input type="hidden" name="id" value={id} />

                <button type="submit">Permanently delete article</button>
              </form>
            </Modal>
          </div>
        </article>
      {/each}
    </section>
  {/if}
</WebsiteEditor>

<style>
  .article-card {
    display: flex;
    align-items: center;
    column-gap: 2rem;
    row-gap: 0.5rem;
    flex-wrap: wrap;
    justify-content: space-between;
  }

  .article-card:nth-of-type(1) {
    margin-block-start: 1rem;
  }

  .article-card__actions {
    display: flex;
    gap: 1rem;
    align-items: center;
  }
</style>
