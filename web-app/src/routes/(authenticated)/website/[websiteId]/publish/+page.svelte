<script lang="ts">
  import { enhance } from "$app/forms";
  import WebsiteEditor from "$lib/components/WebsiteEditor.svelte";
  import SuccessOrError from "$lib/components/SuccessOrError.svelte";
  import type { ActionData, PageServerData } from "./$types";
  import LoadingSpinner from "$lib/components/LoadingSpinner.svelte";

  const { data, form }: { data: PageServerData; form: ActionData } = $props();

  const prodWebsiteUrl = data.websitePreviewUrl.replace("/previews", "");

  let sending = $state(false);
</script>

<SuccessOrError success={form?.success} message={form?.message} />

{#if sending}
  <LoadingSpinner />
{/if}

<WebsiteEditor
  id={data.website.id}
  contentType={data.website.content_type}
  title={data.website.title}
  previewContent={data.websitePreviewUrl}
  fullPreview={true}
>
  <section id="publish-website">
    <h2>
      <a href="#publish-website">Publish website</a>
    </h2>
    <p>
      The preview area on this page allows you to see exactly how your website will look when it is
      is published. If you are happy with the results, click the button below and your website will
      be published on the Internet.
    </p>
    <form
      method="POST"
      action="?/publishWebsite"
      use:enhance={() => {
        sending = true;
        return async ({ update }) => {
          await update();
          sending = false;
        };
      }}
    >
      <button type="submit">Publish</button>
    </form>

    {#if data.website.is_published}
      <section>
        <h3>
          <a href="#publication-status">Publication status</a>
        </h3>
        <p>
          Your website is published at:
          <br />
          <a href={prodWebsiteUrl}>{prodWebsiteUrl}</a>
        </p>
      </section>
    {/if}
  </section>
</WebsiteEditor>
