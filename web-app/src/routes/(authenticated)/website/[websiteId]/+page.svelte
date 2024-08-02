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
  previewContent={data.home.main_content}
>
  <section>
    <h2>Global</h2>
    <form
      action="?/updateGlobal"
      method="POST"
      enctype="multipart/form-data"
      use:enhance={() => {
        return async ({ update }) => {
          await update({ reset: false });
        };
      }}
    >
      <label>
        Light accent color:
        <input
          type="color"
          name="accent-color-light"
          value={data.globalSettings.accent_color_light_theme}
        />
      </label>
      <label>
        Light accent color:
        <input
          type="color"
          name="accent-color-dark"
          value={data.globalSettings.accent_color_dark_theme}
        />
      </label>
      <label>
        Favicon:
        <input type="file" name="favicon" accept={ALLOWED_MIME_TYPES.join(", ")} />
      </label>

      <button type="submit">Submit</button>
    </form>
  </section>

  <section>
    <h2>Header</h2>

    <form
      action="?/updateHeader"
      method="POST"
      enctype="multipart/form-data"
      use:enhance={() => {
        return async ({ update }) => {
          await update({ reset: false });
        };
      }}
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
        <input type="text" name="logo-text" value={data.header.logo_text} />
      </label>
      <label>
        Logo image:
        <input type="file" name="logo-image" accept={ALLOWED_MIME_TYPES.join(", ")} />
      </label>

      <button type="submit">Submit</button>
    </form>
  </section>

  <section>
    <h2>Home</h2>

    <form
      action="?/updateHome"
      method="POST"
      use:enhance={() => {
        return async ({ update }) => {
          await update({ reset: false });
        };
      }}
    >
      <label>
        Main content:
        <textarea name="main-content">{data.home.main_content}</textarea>
      </label>

      <button type="submit">Submit</button>
    </form>
  </section>

  <section>
    <h2>Footer</h2>

    <form
      action="?/updateFooter"
      method="POST"
      use:enhance={() => {
        return async ({ update }) => {
          await update({ reset: false });
        };
      }}
    >
      <label>
        Additional text:
        <textarea name="additional-text">{data.footer.additional_text}</textarea>
      </label>

      <button type="submit">Submit</button>
    </form>
  </section>
</WebsiteEditor>
