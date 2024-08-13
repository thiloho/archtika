<script lang="ts">
  import { enhance } from "$app/forms";
  import WebsiteEditor from "$lib/components/WebsiteEditor.svelte";
  import { ALLOWED_MIME_TYPES } from "$lib/utils";
  import SuccessOrError from "$lib/components/SuccessOrError.svelte";
  import type { ActionData, PageServerData } from "./$types";
  import Modal from "$lib/components/Modal.svelte";

  const { data, form } = $props<{ data: PageServerData; form: ActionData }>();
</script>

<SuccessOrError success={form?.success} message={form?.message} />

<WebsiteEditor
  id={data.website.id}
  title={data.website.title}
  previewContent={data.article.main_content ||
    "Put some markdown content in main content to see a live preview here"}
>
  <section>
    <h2>Edit article</h2>

    <form
      method="POST"
      enctype="multipart/form-data"
      use:enhance={() => {
        return async ({ update }) => {
          await update({ reset: false });
        };
      }}
    >
      <label>
        Title:
        <input
          type="text"
          name="title"
          value={data.article.title}
          pattern="\S(.*\S)?"
          maxlength="100"
          required
        />
      </label>
      <label>
        Description:
        <textarea name="description" rows="5" maxlength="250" required
          >{data.article.meta_description}</textarea
        >
      </label>
      <label>
        Author:
        <input
          type="text"
          name="author"
          value={data.article.meta_author}
          pattern="\S(.*\S)?"
          maxlength="100"
          required
        />
      </label>
      <label>
        Publication date:
        <input type="date" name="publication-date" value={data.article.publication_date} required />
      </label>
      <div class="file-field">
        <label>
          Cover image:
          <input type="file" name="cover-image" accept={ALLOWED_MIME_TYPES.join(", ")} />
        </label>
        {#if data.article.cover_image}
          <Modal id="preview-cover-article-{data.article.id}" text="Preview">
            <img src={`/api/rpc/retrieve_file?id=${data.article.cover_image}`} alt="" />
          </Modal>
        {/if}
      </div>
      <label>
        Main content:
        <textarea name="main-content" rows="20" required>{data.article.main_content}</textarea>
      </label>

      <button type="submit">Submit</button>
    </form>
  </section>
</WebsiteEditor>
