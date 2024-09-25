<script lang="ts">
  import { enhance } from "$app/forms";
  import WebsiteEditor from "$lib/components/WebsiteEditor.svelte";
  import SuccessOrError from "$lib/components/SuccessOrError.svelte";
  import Modal from "$lib/components/Modal.svelte";
  import LoadingSpinner from "$lib/components/LoadingSpinner.svelte";
  import type { ActionData, PageServerData } from "./$types";

  const { data, form }: { data: PageServerData; form: ActionData } = $props();

  let sending = $state(false);
  let loadingDelay: number;
</script>

<SuccessOrError success={form?.success} message={form?.message} />

{#if sending}
  <LoadingSpinner />
{/if}

<WebsiteEditor
  id={data.website.id}
  contentType={data.website.content_type}
  title={data.website.title}
  previewContent={data.home.main_content}
>
  <section id="add-collaborator">
    <h2>
      <a href="#add-collaborator">Add collaborator</a>
    </h2>

    <Modal id="add-collaborator" text="Add collaborator">
      <h3>Add collaborator</h3>

      <form
        method="POST"
        action="?/addCollaborator"
        use:enhance={() => {
          loadingDelay = window.setTimeout(() => (sending = true), 500);
          return async ({ update }) => {
            await update();
            window.clearTimeout(loadingDelay);
            window.location.hash = "!";
            sending = false;
          };
        }}
      >
        <label>
          Username:
          <input type="text" name="username" minlength="3" maxlength="16" required />
        </label>

        <label>
          Permission level:
          <select name="permission-level">
            <option value="10">10 - View</option>
            <option value="20">20 - Edit</option>
            <option value="30">30 - Manage</option>
          </select>
        </label>

        <button type="submit">Submit</button>
      </form>
    </Modal>
  </section>

  {#if data.collaborators.length > 0}
    <section id="all-collaborators">
      <h2>
        <a href="#all-collaborators">All collaborators</a>
      </h2>

      <ul class="unpadded">
        {#each data.collaborators as { website_id, user_id, permission_level, user } (`${website_id}-${user_id}`)}
          <li class="collaborator-card">
            <p>
              <strong>{user?.username} ({permission_level})</strong>
            </p>

            <div class="collaborator-card__actions">
              <Modal id="update-collaborator-{user_id}" text="Update">
                <h4>Update collaborator</h4>

                <form
                  method="POST"
                  action="?/updateCollaborator"
                  use:enhance={() => {
                    loadingDelay = window.setTimeout(() => (sending = true), 500);
                    return async ({ update }) => {
                      await update({ reset: false });
                      window.clearTimeout(loadingDelay);
                      window.location.hash = "!";
                      sending = false;
                    };
                  }}
                >
                  <input type="hidden" name="user-id" value={user_id} />

                  <label>
                    Permission level:
                    <select name="permission-level">
                      <option value="10" selected={10 === permission_level}>10 - View</option>
                      <option value="20" selected={20 === permission_level}>20 - Edit</option>
                      <option value="30" selected={30 === permission_level}>30 - Manage</option>
                    </select>
                  </label>

                  <button type="submit">Update collaborator</button>
                </form>
              </Modal>
              <Modal id="remove-collaborator-{user_id}" text="Remove">
                <h4>Remove collaborator</h4>

                <p>Do you really want to remove the collaborator?</p>

                <form
                  method="POST"
                  action="?/removeCollaborator"
                  use:enhance={() => {
                    loadingDelay = window.setTimeout(() => (sending = true), 500);
                    return async ({ update }) => {
                      await update();
                      window.clearTimeout(loadingDelay);
                      window.location.hash = "!";
                      sending = false;
                    };
                  }}
                >
                  <input type="hidden" name="user-id" value={user_id} />

                  <button type="submit">Remove collaborator</button>
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
  .collaborator-card {
    display: flex;
    align-items: center;
    column-gap: var(--space-s);
    row-gap: var(--space-2xs);
    flex-wrap: wrap;
    justify-content: space-between;
    margin-block-start: var(--space-xs);
  }

  .collaborator-card + .collaborator-card {
    padding-block-start: var(--space-xs);
    border-block-start: var(--border-primary);
  }

  .collaborator-card__actions {
    display: flex;
    gap: var(--space-2xs);
    align-items: center;
  }
</style>
