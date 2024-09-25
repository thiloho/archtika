<script lang="ts">
  import { enhance } from "$app/forms";
  import WebsiteEditor from "$lib/components/WebsiteEditor.svelte";
  import SuccessOrError from "$lib/components/SuccessOrError.svelte";
  import type { ActionData, PageServerData } from "./$types";
  import LoadingSpinner from "$lib/components/LoadingSpinner.svelte";
  import Modal from "$lib/components/Modal.svelte";

  const { data, form }: { data: PageServerData; form: ActionData } = $props();

  let sending = $state(false);
  let loadingDelay: number;
</script>

<SuccessOrError success={form?.success} message={form?.message} />

{#if sending}
  <LoadingSpinner />
{/if}

<WebsiteEditor
  id={data.websiteOverview.id}
  contentType={data.websiteOverview.content_type}
  title={data.websiteOverview.title}
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
        loadingDelay = window.setTimeout(() => (sending = true), 500);
        return async ({ update }) => {
          await update();
          window.clearTimeout(loadingDelay);
          sending = false;
        };
      }}
    >
      <button type="submit">Publish</button>
    </form>
  </section>

  {#if data.websiteOverview.is_published}
    <section id="publication-status">
      <h2>
        <a href="#publication-status">Publication status</a>
      </h2>
      <p>
        Your website is published at:
        <br />
        <a href={data.websiteProdUrl}>{data.websiteProdUrl}</a>
      </p>
    </section>

    <section id="custom-domain-prefix">
      <h2>
        <a href="#custom-domain-prefix">Custom domain prefix</a>
      </h2>
      <form
        method="POST"
        action="?/createUpdateCustomDomainPrefix"
        use:enhance={() => {
          loadingDelay = window.setTimeout(() => (sending = true), 500);
          return async ({ update }) => {
            await update();
            window.clearTimeout(loadingDelay);
            sending = false;
          };
        }}
      >
        <label>
          Prefix:
          <input
            type="text"
            name="domain-prefix"
            value={data.websiteOverview.domain_prefix?.prefix ?? ""}
            placeholder="my-blog"
            minlength="3"
            maxlength="16"
            pattern="^[a-z]+(-[a-z]+)*$"
            required
          />
        </label>
        <button type="submit">Submit</button>
      </form>
      {#if data.websiteOverview.domain_prefix?.prefix}
        <Modal id="delete-domain-prefix" text="Delete">
          <form
            action="?/deleteCustomDomainPrefix"
            method="post"
            use:enhance={() => {
              loadingDelay = window.setTimeout(() => (sending = true), 500);
              return async ({ update }) => {
                await update();
                window.clearTimeout(loadingDelay);
                window.location.hash = "!";
                sending = false;
              };
            }}
          >
            <h3>Delete domain prefix</h3>
            <p>
              <strong>Caution!</strong>
              This action will remove the domain prefix and reset it to its initial value.
            </p>
            <button type="submit">Delete domain prefix</button>
          </form>
        </Modal>
      {/if}
    </section>
  {/if}
</WebsiteEditor>
