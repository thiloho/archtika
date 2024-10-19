<script lang="ts">
  import { enhance } from "$app/forms";
  import WebsiteEditor from "$lib/components/WebsiteEditor.svelte";
  import SuccessOrError from "$lib/components/SuccessOrError.svelte";
  import Modal from "$lib/components/Modal.svelte";
  import LoadingSpinner from "$lib/components/LoadingSpinner.svelte";
  import type { ActionData, PageServerData } from "./$types";
  import { enhanceForm } from "$lib/utils";
  import { sending } from "$lib/runes.svelte";
  import { previewContent } from "$lib/runes.svelte";

  const { data, form }: { data: PageServerData; form: ActionData } = $props();

  previewContent.value = data.home.main_content;
</script>

<SuccessOrError success={form?.success} message={form?.message} />

{#if sending.value}
  <LoadingSpinner />
{/if}

<WebsiteEditor
  id={data.website.id}
  contentType={data.website.content_type}
  title={data.website.title}
>
  <section id="create-category">
    <h2>
      <a href="#create-category">Create category</a>
    </h2>

    <Modal id="create-category" text="Create category">
      <h3>Create category</h3>

      <form method="POST" action="?/createCategory" use:enhance={enhanceForm({ closeModal: true })}>
        <label>
          Name:
          <input type="text" name="category-name" maxlength="50" required />
        </label>

        <label>
          Weight:
          <input name="category-weight" type="number" min="0" required />
        </label>

        <button type="submit" disabled={data.permissionLevel === 10}>Submit</button>
      </form>
    </Modal>
  </section>

  {#if data.categories.length > 0}
    <section id="all-categories">
      <h2>
        <a href="#all-categories">All categories</a>
      </h2>

      <ul class="unpadded">
        {#each data.categories as { id, website_id, user_id, category_name, category_weight } (`${website_id}-${id}`)}
          <li class="category-card">
            <p>
              <strong>{category_name} ({category_weight})</strong>
            </p>

            <div class="category-card__actions">
              <Modal id="update-category-{id}" text="Update">
                <h4>Update category</h4>

                <form
                  method="POST"
                  action="?/updateCategory"
                  use:enhance={enhanceForm({ reset: false, closeModal: true })}
                >
                  <input type="hidden" name="category-id" value={id} />

                  <label>
                    Name:
                    <input
                      type="text"
                      name="category-name"
                      value={category_name}
                      maxlength="50"
                      required
                    />
                  </label>

                  <label>
                    Weight:
                    <input type="number" name="category-weight" value={category_weight} min="0" />
                  </label>

                  <button type="submit" disabled={data.permissionLevel === 10}
                    >Update category</button
                  >
                </form>
              </Modal>
              <Modal id="delete-category-{id}" text="Delete">
                <h4>Delete category</h4>

                <p>Do you really want to delete the category?</p>

                <form
                  method="POST"
                  action="?/deleteCategory"
                  use:enhance={enhanceForm({ closeModal: true })}
                >
                  <input type="hidden" name="category-id" value={id} />

                  <button
                    type="submit"
                    disabled={data.permissionLevel === 10 ||
                      (data.permissionLevel === 20 && user_id !== data.user.id)}
                    >Delete category</button
                  >
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
  .category-card {
    display: flex;
    align-items: center;
    column-gap: var(--space-s);
    row-gap: var(--space-2xs);
    flex-wrap: wrap;
    justify-content: space-between;
    margin-block-start: var(--space-xs);
  }

  .category-card + .category-card {
    padding-block-start: var(--space-xs);
    border-block-start: var(--border-primary);
  }

  .category-card__actions {
    display: flex;
    gap: var(--space-2xs);
    align-items: center;
  }
</style>
