<script lang="ts">
  import WebsiteEditor from "$lib/components/WebsiteEditor.svelte";
  import DateTime from "$lib/components/DateTime.svelte";
  import Modal from "$lib/components/Modal.svelte";
  import type { PageServerData } from "./$types";
  import diff from "fast-diff";
  import { page } from "$app/stores";
  import { tables } from "$lib/db-schema";

  const { data }: { data: PageServerData } = $props();

  const htmlDiff = (oldValue: string, newValue: string) => {
    return diff(oldValue, newValue)
      .map(([type, value]) => {
        let newString = "";

        switch (type) {
          case 1:
            newString += `<ins>${value}</ins>`;
            break;
          case 0:
            newString += `${value}`;
            break;
          case -1:
            newString += `<del>${value}</del>`;
            break;
        }

        return newString;
      })
      .join("");
  };

  let resources = $state({});

  if (data.website.content_type === "Blog") {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { user, change_log, media, docs_category, ...restTables } = tables;
    resources = restTables;
  }

  if (data.website.content_type === "Docs") {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { user, change_log, media, ...restTables } = tables;
    resources = restTables;
  }

  let logsSection: HTMLElement;
</script>

<WebsiteEditor
  id={data.website.id}
  contentType={data.website.content_type}
  title={data.website.title}
  previewContent={data.home.main_content}
>
  <section id="logs" bind:this={logsSection}>
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
            name="logs_filter_user"
            value={$page.url.searchParams.get("logs_filter_user")}
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
          <select name="logs_filter_resource">
            <option value="all">Show all</option>
            {#each Object.keys(resources) as resource}
              <option
                value={resource}
                selected={resource === $page.url.searchParams.get("logs_filter_resource")}
                >{resource}</option
              >
            {/each}
          </select>
        </label>
        <label>
          Operation:
          <select name="logs_filter_operation">
            <option value="all">Show all</option>
            <option
              value="insert"
              selected={"insert" === $page.url.searchParams.get("logs_filter_operation")}
              >Insert</option
            >
            <option
              value="update"
              selected={"update" === $page.url.searchParams.get("logs_filter_operation")}
              >Update</option
            >
            <option
              value="delete"
              selected={"delete" === $page.url.searchParams.get("logs_filter_operation")}
              >Delete</option
            >
          </select>
        </label>
        <input type="hidden" name="logs_results_page" value={1} />
        <button type="submit">Submit</button>
      </form>
    </details>
    <div class="scroll-container">
      <table>
        <thead>
          <tr>
            <th>User</th>
            <th>Resource</th>
            <th>Operation</th>
            <th>Date and time</th>
            <th>Changes</th>
          </tr>
        </thead>
        <tbody>
          {#each data.changeLog as { id, table_name, operation, tstamp, old_value, new_value, user_id, username }}
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
                    <p>{table_name} &mdash; {operation}</p>
                  </hgroup>

                  <pre style="white-space: pre-wrap">{@html htmlDiff(oldValue, newValue)}</pre>
                </Modal>
              </td>
            </tr>
          {/each}
        </tbody>
      </table>
    </div>
    <div class="pagination">
      {#snippet commonFilterInputs()}
        <input
          type="hidden"
          name="logs_filter_user"
          value={$page.url.searchParams.get("logs_filter_user")}
        />
        <input
          type="hidden"
          name="logs_filter_resource"
          value={$page.url.searchParams.get("logs_filter_resource")}
        />
        <input
          type="hidden"
          name="logs_filter_operation"
          value={$page.url.searchParams.get("logs_filter_operation")}
        />
      {/snippet}
      <p>
        {$page.url.searchParams.get("logs_results_page") ?? 1} / {Math.max(
          Math.ceil(data.resultChangeLogCount / 50),
          1
        )}
      </p>
      <form method="GET">
        <input type="hidden" name="logs_results_page" value={1} />
        {@render commonFilterInputs()}
        <button
          type="submit"
          disabled={($page.url.searchParams.get("logs_results_page") ?? "1") === "1"}>First</button
        >
      </form>
      <form method="GET">
        <input
          type="hidden"
          name="logs_results_page"
          value={Math.max(
            1,
            Number.parseInt($page.url.searchParams.get("logs_results_page") ?? "1") - 1
          )}
        />
        {@render commonFilterInputs()}
        <button
          type="submit"
          disabled={($page.url.searchParams.get("logs_results_page") ?? "1") === "1"}
          >Previous</button
        >
      </form>
      <form method="GET">
        <input
          type="hidden"
          name="logs_results_page"
          value={Math.min(
            Math.max(Math.ceil(data.resultChangeLogCount / 50), 1),
            Number.parseInt($page.url.searchParams.get("logs_results_page") ?? "1") + 1
          )}
        />
        {@render commonFilterInputs()}
        <button
          type="submit"
          disabled={($page.url.searchParams.get("logs_results_page") ?? "1") ===
            Math.max(Math.ceil(data.resultChangeLogCount / 50), 1).toString()}>Next</button
        >
      </form>
      <form method="GET">
        <input
          type="hidden"
          name="logs_results_page"
          value={Math.max(Math.ceil(data.resultChangeLogCount / 50), 1)}
        />
        {@render commonFilterInputs()}
        <button
          type="submit"
          disabled={($page.url.searchParams.get("logs_results_page") ?? "1") ===
            Math.max(Math.ceil(data.resultChangeLogCount / 50), 1).toString()}>Last</button
        >
      </form>
    </div>
  </section>
</WebsiteEditor>

<style>
  .pagination {
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    gap: var(--space-xs);
    justify-content: end;
  }

  .pagination > form:first-of-type {
    margin-inline-start: auto;
  }

  button:disabled {
    pointer-events: none;
    color: hsl(0 0% 50%);
  }
</style>
