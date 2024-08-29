<script lang="ts">
  import { enhance } from "$app/forms";
  import WebsiteEditor from "$lib/components/WebsiteEditor.svelte";
  import { ALLOWED_MIME_TYPES } from "$lib/utils";
  import SuccessOrError from "$lib/components/SuccessOrError.svelte";
  import type { ActionData, PageServerData } from "./$types";
  import Modal from "$lib/components/Modal.svelte";
  import { handleImagePaste } from "$lib/utils";

  const { data, form }: { data: PageServerData; form: ActionData } = $props();

  let previewContent = $state(data.article.main_content);
  let mainContentTextarea: HTMLTextAreaElement;
  let textareaScrollTop = $state(0);

  const updateScrollPercentage = () => {
    const { scrollTop, scrollHeight, clientHeight } = mainContentTextarea;
    textareaScrollTop = (scrollTop / (scrollHeight - clientHeight)) * 100;
  };

  const handlePaste = async (event: ClipboardEvent) => {
    const newContent = await handleImagePaste(event, data.API_BASE_PREFIX);
    if (newContent) {
      previewContent = newContent;
    }
  };
</script>

<SuccessOrError success={form?.success} message={form?.message} />

<WebsiteEditor
  id={data.website.id}
  contentType={data.website.content_type}
  title={data.website.title}
  previewContent={previewContent ||
    "Put some markdown content in main content to see a live preview here"}
  previewScrollTop={textareaScrollTop}
>
  <section id="edit-article">
    <h2>
      <a href="#edit-article">Edit article</a>
    </h2>

    <form
      method="POST"
      action="?/editArticle"
      enctype="multipart/form-data"
      use:enhance={() => {
        return async ({ update }) => {
          await update({ reset: false });
        };
      }}
    >
      {#if data.website.content_type === "Docs"}
        <label>
          Weight:
          <input type="number" name="article-weight" value={data.article.article_weight} min="0" />
        </label>

        <label>
          Category:
          <select name="category">
            {#each data.categories as { id, category_name }}
              <option value={id} selected={id === data.article.category}>{category_name}</option>
            {/each}
          </select>
        </label>
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
            <img
              src={`${data.API_BASE_PREFIX}/rpc/retrieve_file?id=${data.article.cover_image}`}
              alt=""
            />
          </Modal>
        {/if}
      </div>
      <label>
        Main content:
        <textarea
          name="main-content"
          rows="20"
          bind:value={previewContent}
          bind:this={mainContentTextarea}
          onscroll={updateScrollPercentage}
          onpaste={handlePaste}
          required>{data.article.main_content}</textarea
        >
      </label>

      <button type="submit">Submit</button>
    </form>
  </section>
</WebsiteEditor>
