<script lang="ts">
  import { enhance } from "$app/forms";
  import Modal from "$lib/components/Modal.svelte";
  import SuccessOrError from "$lib/components/SuccessOrError.svelte";
  import LoadingSpinner from "$lib/components/LoadingSpinner.svelte";
  import type { ActionData, PageServerData } from "./$types";
  import { enhanceForm } from "$lib/utils";
  import { sending } from "$lib/runes.svelte";
  import DateTime from "$lib/components/DateTime.svelte";
  import Pagination from "$lib/components/Pagination.svelte";

  const { data, form }: { data: PageServerData; form: ActionData } = $props();
</script>

<SuccessOrError success={form?.success} message={form?.message} />

{#if sending.value}
  <LoadingSpinner />
{/if}

<section id="all-users">
  <hgroup>
    <h2>
      <a href="#all-users">All users</a>
    </h2>
    <p>
      <strong>{data.resultUsersCount.toLocaleString("en", { useGrouping: true })}</strong>
      <small>result(s)</small>
    </p>
  </hgroup>
  <div class="scroll-container">
    <table>
      <thead>
        <tr>
          <th>Account creation</th>
          <th>UUID</th>
          <th>Username</th>
          <th>Manage</th>
        </tr>
      </thead>
      <tbody>
        {#each data.usersWithWebsites as { id, created_at, username, max_number_websites, website }}
          <tr>
            <td>
              <DateTime date={created_at} />
            </td>
            <td>{id}</td>
            <td>{username}</td>
            <td>
              <Modal id="manage-user-{id}" text="Manage">
                <hgroup>
                  <h3>Manage user</h3>
                  <p>User "{username}"</p>
                </hgroup>

                <form
                  method="POST"
                  action="?/updateMaxWebsiteAmount"
                  use:enhance={enhanceForm({ reset: false })}
                >
                  <input type="hidden" name="user-id" value={id} />
                  <label>
                    Number of websites allowed:
                    <input
                      type="number"
                      name="number-of-websites"
                      min="0"
                      value={max_number_websites}
                    />
                  </label>
                  <button type="submit">Submit</button>
                </form>

                {#if website.length > 0}
                  <h4>Websites</h4>
                  {#each website as { id, title, max_storage_size }}
                    <details>
                      <summary>{title}</summary>
                      <div>
                        <form
                          method="POST"
                          action="?/updateStorageLimit"
                          use:enhance={enhanceForm({ reset: false })}
                        >
                          <input type="hidden" name="website-id" value={id} />
                          <label>
                            Storage limit in MB:
                            <input
                              type="number"
                              name="storage-size"
                              min="0"
                              value={max_storage_size}
                            />
                          </label>
                          <button type="submit">Submit</button>
                        </form>
                      </div>
                    </details>
                  {/each}
                {/if}

                <h4>Delete user</h4>
                <details>
                  <summary>Delete</summary>
                  <div>
                    <p>
                      <strong>Caution!</strong>
                      Deleting the user will irretrievably erase all their data.
                    </p>
                    <form
                      method="POST"
                      action="?/deleteUser"
                      use:enhance={enhanceForm({ closeModal: true })}
                    >
                      <input type="hidden" name="user-id" value={id} />
                      <button type="submit">Delete user</button>
                    </form>
                  </div>
                </details>
              </Modal>
            </td>
          </tr>
        {/each}
      </tbody>
    </table>
  </div>
  <Pagination resultCount={data.resultUsersCount} />
</section>

<style>
  form[action="?/deleteUser"] {
    margin-block-start: var(--space-2xs);
  }
</style>
