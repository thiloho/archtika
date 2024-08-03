<script lang="ts">
  import { enhance } from "$app/forms";
  import WebsiteEditor from "$lib/components/WebsiteEditor.svelte";
  import { ALLOWED_MIME_TYPES } from "$lib/utils";
  import SuccessOrError from "$lib/components/SuccessOrError.svelte";

  const { data, form } = $props();
</script>

<SuccessOrError success={form?.success} message={form?.message} />

<WebsiteEditor
  id={data.website.id}
  title={data.website.title}
  previewContent={data.article.main_content}
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
        <input type="text" name="title" value={data.article.title} />
      </label>
      <label>
        Description:
        <textarea name="description" rows="5">{data.article.meta_description}</textarea>
      </label>
      <label>
        Author:
        <input type="text" name="author" value={data.article.meta_author} />
      </label>
      <label>
        Publication date:
        <input type="date" name="publication-date" value={data.article.publication_date} />
      </label>
      <label>
        Cover image:
        <input type="file" name="cover-image" accept={ALLOWED_MIME_TYPES.join(", ")} />
      </label>
      <label>
        Main content:
        <textarea name="main-content" rows="20">{data.article.main_content}</textarea>
      </label>

      <button type="submit">Submit</button>
    </form>
  </section>
</WebsiteEditor>
