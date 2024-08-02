<script lang="ts">
  import { enhance } from "$app/forms";
  import DateTime from "$lib/components/DateTime.svelte";
  import { sortOptions } from "$lib/utils.js";
  import { page } from "$app/stores";
  import Modal from "$lib/components/Modal.svelte";
  import SuccessOrError from "$lib/components/SuccessOrError.svelte";

  const { form, data } = $props();
</script>

<SuccessOrError success={form?.success} message={form?.message} />

<section>
  <h2>Create website</h2>

  <Modal id="create-website" text="Create website">
    <h3>Create website</h3>

    <form
      method="POST"
      action="?/createWebsite"
      use:enhance={() => {
        return async ({ update }) => {
          await update();
          window.location.hash = "!";
        };
      }}
    >
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
  </Modal>
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

    <div class="website-grid">
      {#each data.websites as { id, content_type, title, created_at }}
        <article class="website-card">
          <h3>
            <a href="/website/{id}">{title}</a>
          </h3>
          <ul>
            <li>
              <strong>Type:</strong>
              {content_type}
            </li>
            <li>
              <strong>Created at:</strong>
              <DateTime date={created_at} />
            </li>
          </ul>
          <div class="website-card__actions">
            <Modal id="update-website-{id}" text="Update">
              <h4>Update website</h4>

              <form
                method="POST"
                action="?/updateWebsite"
                use:enhance={() => {
                  return async ({ update }) => {
                    await update({ reset: false });
                    window.location.hash = "!";
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
            </Modal>
            <Modal id="delete-website-{id}" text="Delete">
              <h4>Delete website</h4>

              <p>
                <strong>Caution!</strong>
                Deleting this website will irretrievably erase all data.
              </p>
              <form
                method="POST"
                action="?/deleteWebsite"
                use:enhance={() => {
                  return async ({ update }) => {
                    await update();
                    window.location.hash = "!";
                  };
                }}
              >
                <input type="hidden" name="id" value={id} />

                <button type="submit">Permanently delete website</button>
              </form>
            </Modal>
          </div>
        </article>
      {/each}
    </div>
  </section>
{/if}

<style>
  .website-grid {
    display: grid;
    gap: 1rem;
    grid-template-columns: repeat(auto-fit, minmax(min(100%, 35ch), 1fr));
    margin-block-start: 1rem;
  }

  .website-card {
    border: var(--border-primary);
    display: flex;
    flex-direction: column;
    gap: 1rem;
    padding-inline: 1rem;
    padding-block: 2rem;
  }

  .website-card__actions {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    flex-wrap: wrap;
  }
</style>
