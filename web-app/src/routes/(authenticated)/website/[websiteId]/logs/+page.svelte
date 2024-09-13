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
    const { user, change_log, media, docs_category, ...restTables } = tables;
    resources = restTables;
  }

  if (data.website.content_type === "Docs") {
    const { user, change_log, media, ...restTables } = tables;
    resources = restTables;
  }
</script>

<WebsiteEditor
  id={data.website.id}
  contentType={data.website.content_type}
  title={data.website.title}
  previewContent={data.home.main_content}
>
  <section id="logs">
    <hgroup>
      <h2>
        <a href="#logs">Logs</a>
      </h2>
      <p>
        <strong>{data.resultChangeLogCount}</strong>
        <small>results</small>
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
          {#each data.changeLog as { id, table_name, operation, tstamp, old_value, new_value, user }}
            <tr>
              <td>{user.username}</td>
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
  </section>
</WebsiteEditor>
