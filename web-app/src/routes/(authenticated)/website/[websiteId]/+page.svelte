<script lang="ts">
  import { enhance } from "$app/forms";
  import WebsiteEditor from "$lib/components/WebsiteEditor.svelte";
  import { ALLOWED_MIME_TYPES } from "$lib/utils";
  import SuccessOrError from "$lib/components/SuccessOrError.svelte";
  import type { ActionData, LayoutServerData, PageServerData } from "./$types";
  import Modal from "$lib/components/Modal.svelte";
  import LoadingSpinner from "$lib/components/LoadingSpinner.svelte";
  import { enhanceForm } from "$lib/utils";
  import { sending } from "$lib/runes.svelte";
  import MarkdownEditor from "$lib/components/MarkdownEditor.svelte";
  import { previewContent } from "$lib/runes.svelte";

  const { data, form }: { data: PageServerData & LayoutServerData; form: ActionData } = $props();

  previewContent.value = data.home.main_content;
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
  <section id="global">
    <h2>
      <a href="#global">Global</a>
    </h2>
    <form
      action="?/updateGlobal"
      method="POST"
      enctype="multipart/form-data"
      use:enhance={enhanceForm({ reset: false })}
    >
      <label>
        Background color dark theme:
        <input
          type="color"
          name="background-color-dark"
          value={data.globalSettings.background_color_dark_theme}
          pattern="\S(.*\S)?"
          required
        />
      </label>
      <label>
        Background color light theme:
        <input
          type="color"
          name="background-color-light"
          value={data.globalSettings.background_color_light_theme}
          pattern="\S(.*\S)?"
          required
        />
      </label>
      <label>
        Accent color dark theme:
        <input
          type="color"
          name="accent-color-dark"
          value={data.globalSettings.accent_color_dark_theme}
          pattern="\S(.*\S)?"
          required
        />
      </label>
      <label>
        Accent color light theme:
        <input
          type="color"
          name="accent-color-light"
          value={data.globalSettings.accent_color_light_theme}
          pattern="\S(.*\S)?"
          required
        />
      </label>
      <div class="file-field">
        <label>
          Favicon:
          <input type="file" name="favicon" accept={ALLOWED_MIME_TYPES.join(", ")} />
        </label>
        {#if data.globalSettings.favicon_image}
          <Modal id="preview-favicon-global-{data.globalSettings.website_id}" text="Preview">
            <img
              src={`${data.API_BASE_PREFIX}/rpc/retrieve_file?id=${data.globalSettings.favicon_image}`}
              alt=""
            />
          </Modal>
        {/if}
      </div>

      <button type="submit">Submit</button>
    </form>
  </section>

  <section id="header">
    <h2>
      <a href="#header">Header</a>
    </h2>

    <form
      action="?/updateHeader"
      method="POST"
      enctype="multipart/form-data"
      use:enhance={enhanceForm({ reset: false })}
    >
      <label>
        Logo type:
        <select name="logo-type">
          <option value="text" selected={"text" === data.header.logo_type}>Text</option>
          <option value="image" selected={"image" === data.header.logo_type}>Image</option>
        </select>
      </label>
      <label>
        Logo text:
        <input
          type="text"
          name="logo-text"
          value={data.header.logo_text}
          pattern="\S(.*\S)?"
          required={data.header.logo_type === "text"}
        />
      </label>
      <div class="file-field">
        <label>
          Logo image:
          <input type="file" name="logo-image" accept={ALLOWED_MIME_TYPES.join(", ")} />
        </label>
        {#if data.header.logo_image}
          <Modal id="preview-logo-header-{data.header.website_id}" text="Preview">
            <img
              src={`${data.API_BASE_PREFIX}/rpc/retrieve_file?id=${data.header.logo_image}`}
              alt=""
            />
          </Modal>
        {/if}
      </div>

      <button type="submit">Submit</button>
    </form>
  </section>

  <section id="home">
    <h2>
      <a href="#home">Home</a>
    </h2>

    <form action="?/updateHome" method="POST" use:enhance={enhanceForm({ reset: false })}>
      <MarkdownEditor
        apiPrefix={data.API_BASE_PREFIX}
        label="Main content"
        name="main-content"
        content={data.home.main_content}
      />

      <button type="submit">Submit</button>
    </form>
  </section>

  <section id="footer">
    <h2>
      <a href="#footer">Footer</a>
    </h2>

    <form action="?/updateFooter" method="POST" use:enhance={enhanceForm({ reset: false })}>
      <label>
        Additional text:
        <textarea name="additional-text" rows="5" maxlength="250" required
          >{data.footer.additional_text}</textarea
        >
      </label>

      <button type="submit">Submit</button>
    </form>
  </section>
</WebsiteEditor>
