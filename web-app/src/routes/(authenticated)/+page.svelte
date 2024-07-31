<script lang="ts">
  import { enhance } from "$app/forms";
  import DateTime from "$lib/components/DateTime.svelte";

  const { form, data } = $props();
</script>

<section>
  <h2>Create website</h2>

  <form method="POST" action="?/createWebsite" use:enhance>
    {#if form?.createWebsite?.success}
      <p>Successfully created website</p>
    {/if}

    {#if form?.createWebsite?.success === false}
      <p>{form.createWebsite.message}</p>
    {/if}

    <label>
      Type
      <select name="content-type">
        <option value="Blog">Blog</option>
        <option value="Docs">Docs</option>
      </select>
    </label>
    <label>
      Title
      <input type="text" name="title" />
    </label>

    <button type="submit">Submit</button>
  </form>
</section>

<section>
  <h2>Your websites</h2>

  {#if form?.deleteWebsite?.success}
    <p>Successfully deleted website</p>
  {/if}

  {#if form?.deleteWebsite?.success === false}
    <p>{form.deleteWebsite.message}</p>
  {/if}

  {#each data.websites as { id, content_type, title, created_at }}
    <article>
      <h3>
        <a href="/website/{id}">{title}</a>
      </h3>
      <p>
        <strong>Type:</strong>
        {content_type}
      </p>
      <p>
        <strong>Created at:</strong>
        <DateTime date={created_at} />
      </p>
      <details>
        <summary>Update</summary>
        <form
          method="POST"
          action="?/updateWebsite"
          use:enhance={() => {
            return async ({ update }) => {
              await update({ reset: false });
            };
          }}
        >
          {#if form?.updateWebsite?.success}
            <p>Successfully updated website</p>
          {/if}

          {#if form?.updateWebsite?.success === false}
            <p>{form.updateWebsite.message}</p>
          {/if}

          <input type="hidden" name="id" value={id} />
          <label>
            Title
            <input type="text" name="title" value={title} />
          </label>

          <button type="submit">Submit</button>
        </form>
      </details>
      <details>
        <summary>Delete</summary>
        <!-- TODO: Needs to be password protected -->
        <form method="POST" action="?/deleteWebsite" use:enhance>
          <input type="hidden" name="id" value={id} />

          <button type="submit">Delete</button>
        </form>
      </details>
    </article>
  {/each}
</section>

<section>
  <h2>Shared with you</h2>
</section>
