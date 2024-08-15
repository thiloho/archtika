<script lang="ts">
  import { enhance } from "$app/forms";
  import WebsiteEditor from "$lib/components/WebsiteEditor.svelte";
  import SuccessOrError from "$lib/components/SuccessOrError.svelte";
  import Modal from "$lib/components/Modal.svelte";
  import type { ActionData, PageServerData } from "./$types";

  const { data, form } = $props<{ data: PageServerData; form: ActionData }>();
</script>

<SuccessOrError success={form?.success} message={form?.message} />

<WebsiteEditor
  id={data.website.id}
  title={data.website.title}
  previewContent={data.home.main_content}
>
  <section>
    <h2>Add collaborator</h2>

    <Modal id="add-collaborator" text="Add collaborator">
      <h3>Add collaborator</h3>

      <form
        method="POST"
        action="?/addCollaborator"
        use:enhance={() => {
          return async ({ update }) => {
            await update();
            window.location.hash = "!";
          };
        }}
      >
        <label>
          User id:
          <input type="text" name="user-id" minlength="36" maxlength="36" required />
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
    <section>
      <h2>All collaborators</h2>

      {#each data.collaborators as { website_id, user_id, permission_level, user: { username } } (`${website_id}-${user_id}`)}
        <article class="collaborator-card">
          <h3>{username} ({permission_level})</h3>

          <div class="collaborator-card__actions">
            <Modal id="update-collaborator-{user_id}" text="Update">
              <h4>Update collaborator</h4>

              <form
                method="POST"
                action="?/updateCollaborator"
                use:enhance={() => {
                  return async ({ update }) => {
                    await update({ reset: false });
                    window.location.hash = "!";
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
                  return async ({ update }) => {
                    await update();
                    window.location.hash = "!";
                  };
                }}
              >
                <input type="hidden" name="user-id" value={user_id} />

                <button type="submit">Remove collaborator</button>
              </form>
            </Modal>
          </div>
        </article>
      {/each}
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
  }

  .collaborator-card + .collaborator-card {
    padding-block-start: var(--space-s);
    border-block-start: var(--border-primary);
  }

  .collaborator-card:nth-of-type(1) {
    margin-block-start: var(--space-xs);
  }

  .collaborator-card__actions {
    display: flex;
    gap: var(--space-2xs);
    align-items: center;
  }
</style>
