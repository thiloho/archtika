<script lang="ts">
  import { enhance } from "$app/forms";
  import WebsiteEditor from "$lib/components/WebsiteEditor.svelte";
  import SuccessOrError from "$lib/components/SuccessOrError.svelte";
  import type { ActionData, PageServerData } from "./$types";
  import LoadingSpinner from "$lib/components/LoadingSpinner.svelte";
  import { sending } from "$lib/runes.svelte";
  import { previewContent } from "$lib/runes.svelte";
  import { enhanceForm } from "$lib/utils";

  const { data, form }: { data: PageServerData; form: ActionData } = $props();

  previewContent.value = data.websitePreviewUrl;
</script>

<SuccessOrError success={form?.success} message={form?.message} />

{#if sending.value}
  <LoadingSpinner />
{/if}

<WebsiteEditor
  id={data.websiteOverview.id}
  contentType={data.websiteOverview.content_type}
  title={data.websiteOverview.title}
  fullPreview={true}
>
  <section id="publish-website">
    <h2>
      <a href="#publish-website">Publish website</a>
    </h2>
    <p>
      Whenever you make changes, you will need to click the button below to make them visible on the
      published website.
    </p>
    {#if data.currentMeta}
      <a
        class="latest-changes-anchor"
        href="/website/{data.website.id}/logs?since={data.currentMeta.lastPublishedAt}"
        >Changes since last publication</a
      >
    {/if}
    <form method="POST" action="?/publishWebsite" use:enhance={enhanceForm()}>
      <button type="submit" disabled={[10, 20].includes(data.permissionLevel)}
        >Publish website</button
      >
    </form>
  </section>

  {#if data.prodIsGenerated}
    <section id="publication-status">
      <h2>
        <a href="#publication-status">Publication status</a>
      </h2>
      <p>
        Your website is published at:<br />
        <a href={data.websiteProdUrl}>{data.websiteProdUrl}</a>
      </p>
    </section>
  {/if}
</WebsiteEditor>

<style>
  .latest-changes-anchor {
    max-inline-size: fit-content;
  }
</style>
