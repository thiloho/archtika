<script lang="ts">
  import { enhance } from "$app/forms";
  import WebsiteEditor from "$lib/components/WebsiteEditor.svelte";
  import { ALLOWED_MIME_TYPES } from "$lib/utils";
  import SuccessOrError from "$lib/components/SuccessOrError.svelte";
  import type { ActionData, PageServerData } from "./$types";
  import Modal from "$lib/components/Modal.svelte";
  import LoadingSpinner from "$lib/components/LoadingSpinner.svelte";
  import { enhanceForm } from "$lib/utils";
  import { sending } from "$lib/runes.svelte";
  import { previewContent } from "$lib/runes.svelte";
  import MarkdownEditor from "$lib/components/MarkdownEditor.svelte";

  const { data, form }: { data: PageServerData; form: ActionData } = $props();

  previewContent.value = data.article?.main_content ?? "";
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
  <section id="edit-article">
    <h2>
      <a href="#edit-article">Edit article</a>
    </h2>

    <form
      method="POST"
      action="?/editArticle"
      enctype="multipart/form-data"
      use:enhance={enhanceForm({ reset: false })}
    >
      {#if data.website.content_type === "Docs"}
        <label>
          Weight:
          <input type="number" name="article-weight" value={data.article.article_weight} min="0" />
        </label>

        {#if data.categories.length > 0}
          <label>
            Category:
            <select name="category">
              {#each data.categories as { id, category_name } (id)}
                <option value={id} selected={id === data.article.category}>{category_name}</option>
              {/each}
            </select>
          </label>
        {/if}
      {/if}

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

      {#if data.website.content_type === "Blog"}
        <label>
          Publication date:
          <input
            type="date"
            name="publication-date"
            value={data.article.publication_date ?? new Date().toISOString().split("T")[0]}
            required
          />
        </label>

        <div class="file-field">
          <label>
            Cover image:
            <input type="file" name="cover-image" accept={ALLOWED_MIME_TYPES.join(", ")} />
          </label>
          {#if data.article.cover_image}
            <Modal id="preview-cover-article-{data.article.id}" text="Preview" isWider={true}>
              <img
                src={`${data.API_BASE_PREFIX}/rpc/retrieve_file?id=${data.article.cover_image}`}
                alt=""
              />
              <form
                method="POST"
                action="?/removeCoverImage"
                use:enhance={enhanceForm({ reset: false, closeModal: true })}
              >
                <button type="submit">Remove</button>
              </form>
            </Modal>
          {/if}
        </div>
      {/if}

      <MarkdownEditor
        apiPrefix={data.API_BASE_PREFIX}
        label="Main content"
        name="main-content"
        content={data.article.main_content ?? ""}
      />

      <button type="submit" disabled={data.permissionLevel === 10}>Update article</button>
    </form>
  </section>
</WebsiteEditor>
