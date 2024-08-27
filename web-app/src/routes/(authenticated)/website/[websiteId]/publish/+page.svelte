<script lang="ts">
  import { enhance } from "$app/forms";
  import WebsiteEditor from "$lib/components/WebsiteEditor.svelte";
  import SuccessOrError from "$lib/components/SuccessOrError.svelte";
  import type { ActionData, PageServerData } from "./$types";

  const { data, form }: { data: PageServerData; form: ActionData } = $props();
</script>

<SuccessOrError success={form?.success} message={form?.message} />

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
    {JSON.stringify(data.websiteOverview.articles)}
    <p>
      The preview area on this page allows you to see exactly how your website will look when it is
      is published. If you are happy with the results, click the button below and your website will
      be published on the Internet.
    </p>
    <form method="POST" action="?/publishWebsite" use:enhance>
      <button type="submit">Publish</button>
    </form>
  </section>
</WebsiteEditor>
