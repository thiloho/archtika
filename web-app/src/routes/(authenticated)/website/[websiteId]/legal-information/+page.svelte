<script lang="ts">
  import { enhance } from "$app/forms";
  import WebsiteEditor from "$lib/components/WebsiteEditor.svelte";
  import SuccessOrError from "$lib/components/SuccessOrError.svelte";
  import LoadingSpinner from "$lib/components/LoadingSpinner.svelte";
  import Modal from "$lib/components/Modal.svelte";
  import { enhanceForm } from "$lib/utils";
  import { sending, previewContent } from "$lib/runes.svelte";
  import type { ActionData, PageServerData } from "./$types";
  import MarkdownEditor from "$lib/components/MarkdownEditor.svelte";

  const { data, form }: { data: PageServerData; form: ActionData } = $props();

  previewContent.value = data.legalInformation?.main_content ?? "";
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
  <section id="legal-information">
    <h2>
      <a href="#legal-information">Legal information</a>
    </h2>

    <p>
      Static websites that do not collect user data and do not use cookies generally have minimal
      legal obligations regarding privacy policies, imprints, etc. However, it may still be a good
      idea to include, for example:
    </p>

    <ol>
      <li>A simple privacy policy stating that no personal information is collected or stored</li>
      <li>
        An imprint (if required by local law) with contact information for the site owner/operator
      </li>
    </ol>

    <p>Always consult local laws and regulations for specific requirements in your jurisdiction.</p>

    <p>
      To include a link to your legal information in the footer, you can write <code>!!legal</code>.
    </p>

    <form
      method="POST"
      action="?/createUpdateLegalInformation"
      use:enhance={enhanceForm({ reset: false })}
    >
      <MarkdownEditor
        apiPrefix={data.API_BASE_PREFIX}
        label="Main content"
        name="main-content"
        content={data.legalInformation?.main_content ?? ""}
      />

      <button type="submit" disabled={[10, 20].includes(data.permissionLevel)}>Submit</button>
    </form>

    {#if data.legalInformation?.main_content}
      <Modal id="delete-legal-information" text="Delete">
        <form
          action="?/deleteLegalInformation"
          method="post"
          use:enhance={enhanceForm({ closeModal: true })}
        >
          <h3>Delete legal information</h3>
          <p>
            <strong>Caution!</strong>
            This action will remove the legal information page from the website and delete all data.
          </p>
          <button type="submit" disabled={[10, 20].includes(data.permissionLevel)}
            >Delete legal information</button
          >
        </form>
      </Modal>
    {/if}
  </section>
</WebsiteEditor>

<style>
  form[action="?/createUpdateLegalInformation"] {
    margin-block-start: var(--space-s);
  }
</style>
