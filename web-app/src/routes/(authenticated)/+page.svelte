<script lang="ts">
  import { enhance } from "$app/forms";
  import DateTime from "$lib/components/DateTime.svelte";
  import { page } from "$app/stores";
  import Modal from "$lib/components/Modal.svelte";
  import SuccessOrError from "$lib/components/SuccessOrError.svelte";
  import type { ActionData, PageServerData } from "./$types";
  import LoadingSpinner from "$lib/components/LoadingSpinner.svelte";
  import { enhanceForm } from "$lib/utils";
  import { sending } from "$lib/runes.svelte";

  const { form, data }: { form: ActionData; data: PageServerData } = $props();
</script>

<SuccessOrError success={form?.success} message={form?.message} />

{#if sending.value}
  <LoadingSpinner />
{/if}

<section id="create-website">
  <h2>
    <a href="#create-website">Create website</a>
  </h2>

  <Modal id="create-website" text="Create website">
    <h3>Create website</h3>

    <form method="POST" action="?/createWebsite" use:enhance={enhanceForm({ closeModal: true })}>
      <label>
        Type:
        <select name="content-type">
          <option value="Blog">Blog</option>
          <option value="Docs">Docs</option>
        </select>
      </label>
      <label>
        Title:
        <input type="text" name="title" maxlength="50" pattern="\S(.*\S)?" required />
      </label>

      <button type="submit">Create website</button>
    </form>
  </Modal>
</section>

{#if data.totalWebsiteCount > 0}
  <section id="all-websites">
    <h2>
      <a href="#all-websites">All websites</a>
    </h2>

    <details>
      <summary>Search & Filter</summary>
      <form method="GET">
        <label>
          Search:
          <input type="text" name="query" value={$page.url.searchParams.get("query")} />
        </label>
        <label>
          Filter:
          <select name="filter">
            <option value="all" selected={"all" === $page.url.searchParams.get("filter")}
              >Show all</option
            >
            <option
              value="creations"
              selected={"creations" === $page.url.searchParams.get("filter")}>Created by you</option
            >
            <option value="shared" selected={"shared" === $page.url.searchParams.get("filter")}
              >Shared with you</option
            >
          </select>
        </label>
        <button type="submit">Apply</button>
      </form>
    </details>

    <ul class="website-grid unpadded">
      {#each data.websites as { id, user_id, content_type, title, created_at, collab } (id)}
        <li class="website-card">
          <p>
            <strong>
              <a href="/website/{id}">{title}</a>
            </strong>
          </p>
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
                use:enhance={enhanceForm({ reset: false, closeModal: true })}
              >
                <input type="hidden" name="id" value={id} />
                <label>
                  Title:
                  <input
                    type="text"
                    name="title"
                    value={title}
                    maxlength="50"
                    pattern="\S(.*\S)?"
                    required
                  />
                </label>

                <button
                  type="submit"
                  disabled={data.user.id !== user_id && collab[0].permission_level !== 30}
                  >Update website</button
                >
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
                use:enhance={enhanceForm({ closeModal: true })}
              >
                <input type="hidden" name="id" value={id} />

                <button type="submit" disabled={data.user.id !== user_id}>Delete website</button>
              </form>
            </Modal>
          </div>
        </li>
      {/each}
    </ul>
  </section>
{/if}

<style>
  .website-grid {
    display: grid;
    gap: var(--space-s);
    grid-template-columns: repeat(auto-fit, minmax(min(100%, 35ch), 0.5fr));
    margin-block-start: var(--space-xs);
  }

  .website-card {
    border: var(--border-primary);
    display: flex;
    flex-direction: column;
    gap: var(--space-s);
    padding-inline: var(--space-s);
    padding-block: var(--space-m);
  }

  .website-card__actions {
    display: flex;
    align-items: center;
    gap: var(--space-2xs);
    flex-wrap: wrap;
  }
</style>
