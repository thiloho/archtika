<script lang="ts">
  import { enhance } from "$app/forms";
  import WebsiteEditor from "$lib/components/WebsiteEditor.svelte";
  import { ALLOWED_MIME_TYPES } from "$lib/utils";

  const { data, form } = $props();
</script>

{#if form?.success}
  <p>{form.message}</p>
{/if}

{#if form?.success === false}
  <p>{form.message}</p>
{/if}

<WebsiteEditor
  id={data.website.id}
  title={data.website.title}
  previewContent={data.home.main_content}
>
  <section>
    <h2>Settings</h2>

    <section>
      <h3>Global</h3>
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
      <h3>Header</h3>

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
      <h3>Home</h3>

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
      </form>
    </section>

    <section>
      <h3>Footer</h3>

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
      </form>
    </section>
  </section>
</WebsiteEditor>
