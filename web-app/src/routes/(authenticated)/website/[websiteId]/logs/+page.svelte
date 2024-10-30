<script lang="ts">
  import WebsiteEditor from "$lib/components/WebsiteEditor.svelte";
  import DateTime from "$lib/components/DateTime.svelte";
  import Modal from "$lib/components/Modal.svelte";
  import type { PageServerData, ActionData } from "./$types";
  import { page } from "$app/stores";
  import { tables } from "$lib/db-schema";
  import { previewContent } from "$lib/runes.svelte";
  import DOMPurify from "isomorphic-dompurify";
  import { enhanceForm } from "$lib/utils";
  import { enhance } from "$app/forms";
  import { sending } from "$lib/runes.svelte";
  import LoadingSpinner from "$lib/components/LoadingSpinner.svelte";
  import Pagination from "$lib/components/Pagination.svelte";

  const { data, form }: { data: PageServerData; form: ActionData } = $props();

  let resources = $state({});

  if (data.website.content_type === "Blog") {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { user, change_log, docs_category, ...restTables } = tables;
    resources = restTables;
  }

  if (data.website.content_type === "Docs") {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { user, change_log, ...restTables } = tables;
    resources = restTables;
  }

  previewContent.value = data.home.main_content;
</script>

{#if sending.value}
  <LoadingSpinner />
{/if}

<WebsiteEditor
  id={data.website.id}
  contentType={data.website.content_type}
  title={data.website.title}
>
  <section id="logs">
    <hgroup>
      <h2>
        <a href="#logs">Logs</a>
      </h2>
      <p>
        <strong>{data.resultChangeLogCount.toLocaleString("en", { useGrouping: true })}</strong>
        <small>result(s)</small>
      </p>
    </hgroup>
    <details>
      <summary>Filter</summary>
      <form method="GET">
        <label>
          Username:
          <input
            list="users-{data.website.id}"
            name="user"
            value={$page.url.searchParams.get("user")}
          />
          <datalist id="users-{data.website.id}">
            <option value={data.website.user.username}></option>
            {#each data.collaborators as { user: { username } }}
              <option value={username}></option>
            {/each}
          </datalist>
        </label>
        <label>
          Resource:
          <select name="resource">
            <option value="all">Show all</option>
            {#each Object.keys(resources) as resource}
              <option
                value={resource}
                selected={resource === $page.url.searchParams.get("resource")}>{resource}</option
              >
            {/each}
          </select>
        </label>
        <label>
          Operation:
          <select name="operation">
            <option value="all">Show all</option>
            <option value="insert" selected={"insert" === $page.url.searchParams.get("operation")}
              >Insert</option
            >
            <option value="update" selected={"update" === $page.url.searchParams.get("operation")}
              >Update</option
            >
            <option value="delete" selected={"delete" === $page.url.searchParams.get("operation")}
              >Delete</option
            >
          </select>
        </label>
        <input type="hidden" name="page" value={1} />
        <button type="submit">Apply</button>
      </form>
    </details>
    <div class="scroll-container">
      <table>
        <thead>
          <tr>
            <th>User</th>
            <th>Resource</th>
            <th>Operation</th>
            <th>Time</th>
            <th>Changes</th>
          </tr>
        </thead>
        <tbody>
          {#each data.changeLog as { id, table_name, operation, tstamp, old_value, new_value, user_id, username } (id)}
            <tr>
              <td>
                <span style:text-decoration={user_id ? "" : "line-through"}>
                  {username}
                </span>
              </td>
              <td>{table_name}</td>
              <td>{operation}</td>
              <td>
                <DateTime date={tstamp} />
              </td>
              <td>
                <Modal id="log-{id}" text="Show" isWider={true}>
                  {@const oldValue = JSON.stringify(old_value, null, 2)}
                  {@const newValue = JSON.stringify(new_value, null, 2)}

                  <hgroup>
                    <h3>Log changes</h3>
                    <p>{table_name} &mdash; {operation} &mdash; User "{username}"</p>
                  </hgroup>

                  {#if old_value && new_value}
                    <h4>Difference</h4>
                    <form action="?/computeDiff" method="POST" use:enhance={enhanceForm()}>
                      <input type="hidden" name="id" value={id} />
                      <button type="submit">Compute diff</button>
                    </form>
                    {#if form?.logId === id && form?.currentDiff}
                      <pre>{@html DOMPurify.sanitize(form.currentDiff, {
                          ALLOWED_TAGS: ["ins", "del"]
                        })}</pre>
                    {/if}
                  {/if}

                  {#if new_value && !old_value}
                    <h4>New value</h4>
                    <pre>{DOMPurify.sanitize(newValue)}</pre>
                  {/if}

                  {#if old_value && !new_value}
                    <h4>Old value</h4>
                    <pre>{DOMPurify.sanitize(oldValue)}</pre>
                  {/if}
                </Modal>
              </td>
            </tr>
          {/each}
        </tbody>
      </table>
    </div>
    <Pagination
      commonFilters={["user", "resource", "operation"]}
      resultCount={data.resultChangeLogCount}
    />
  </section>
</WebsiteEditor>

<style>
  pre {
    white-space: pre-wrap;
  }
</style>
