<script lang="ts">
  import WebsiteEditor from "$lib/components/WebsiteEditor.svelte";
  import { sortOptions } from "$lib/utils.js";
  import { page } from "$app/stores";
  import { enhance } from "$app/forms";
  import Modal from "$lib/components/Modal.svelte";
  import SuccessOrError from "$lib/components/SuccessOrError.svelte";
  import type { ActionData, PageServerData } from "./$types";

  const { data, form }: { data: PageServerData; form: ActionData } = $props();
</script>

<SuccessOrError success={form?.success} message={form?.message} />

<WebsiteEditor
  id={data.website.id}
  contentType={data.website.content_type}
  title={data.website.title}
  previewContent={data.home.main_content}
>
  <section id="create-article">
    <h2>
      <a href="#create-article">Create article</a>
    </h2>

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
          <input type="text" name="title" pattern="\S(.*\S)?" maxlength="100" required />
        </label>

        <button type="submit">Submit</button>
      </form>
    </Modal>
  </section>

  {#if data.totalArticleCount > 0}
    <section id="all-articles">
      <h2>
        <a href="#all-articles">All articles</a>
      </h2>

      <details>
        <summary>Search & Filter</summary>
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
            Filter:
            <select name="article_filter">
              <option value="all">Show all</option>
              <option value="creations">Created by you</option>
              <option value="shared">Created by others</option>
            </select>
          </label>
          <button type="submit">Submit</button>
        </form>
      </details>

      <ul class="unpadded">
        {#each data.articles as { id, title, article_weight, docs_category } (id)}
          <li class="article-card">
            <p>
              <strong>{title} {article_weight ? `(${article_weight})` : ""}</strong>
              {#if docs_category?.category_name}
                <br />
                <small>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 16 16"
                    fill="currentColor"
                    width="16"
                    height="16"
                    style="vertical-align: middle"
                  >
                    <path
                      fill-rule="evenodd"
                      d="M4.5 2A2.5 2.5 0 0 0 2 4.5v2.879a2.5 2.5 0 0 0 .732 1.767l4.5 4.5a2.5 2.5 0 0 0 3.536 0l2.878-2.878a2.5 2.5 0 0 0 0-3.536l-4.5-4.5A2.5 2.5 0 0 0 7.38 2H4.5ZM5 6a1 1 0 1 0 0-2 1 1 0 0 0 0 2Z"
                      clip-rule="evenodd"
                    ></path>
                  </svg>

                  {docs_category.category_name}
                </small>
              {/if}
            </p>

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

                  <button type="submit">Delete article</button>
                </form>
              </Modal>
            </div>
          </li>
        {/each}
      </ul>
    </section>
  {/if}
</WebsiteEditor>

<style>
  .article-card {
    display: flex;
    align-items: center;
    column-gap: var(--space-s);
    row-gap: var(--space-2xs);
    flex-wrap: wrap;
    justify-content: space-between;
    margin-block-start: var(--space-xs);
  }

  .article-card + .article-card {
    padding-block-start: var(--space-xs);
    border-block-start: var(--border-primary);
  }

  .article-card__actions {
    display: flex;
    gap: var(--space-s);
    align-items: center;
  }
</style>
