<script lang="ts">
  import { enhance } from "$app/forms";
  import Modal from "$lib/components/Modal.svelte";
  import SuccessOrError from "$lib/components/SuccessOrError.svelte";
  import LoadingSpinner from "$lib/components/LoadingSpinner.svelte";
  import type { ActionData, PageServerData } from "./$types";

  const { data, form }: { data: PageServerData; form: ActionData } = $props();

  let sending = $state(false);
  let loadingDelay: number;
</script>

<SuccessOrError success={form?.success} message={form?.message} />

{#if sending}
  <LoadingSpinner />
{/if}

<section id="overview">
  <h2>
    <a href="#overview">Overview</a>
  </h2>

  <ul>
    <li>
      <strong>Id:</strong>
      {data.user.id}
    </li>
    <li>
      <strong>Username:</strong>
      {data.user.username}
    </li>
  </ul>
</section>

<section id="logout">
  <h2>
    <a href="#logout">Logout</a>
  </h2>

  <form
    method="POST"
    action="?/logout"
    use:enhance={() => {
      loadingDelay = window.setTimeout(() => (sending = true), 500);
      return async ({ update }) => {
        await update();
        window.clearTimeout(loadingDelay);
        sending = false;
      };
    }}
  >
    <button type="submit">Logout</button>
  </form>
</section>

<section id="delete-account">
  <h2>
    <a href="#delete-account">Delete account</a>
  </h2>

  <Modal id="delete-account" text="Delete account">
    <h3>Delete account</h3>

    <p>
      <strong>Caution!</strong>
      Deleting your account will irretrievably erase all data.
    </p>

    <form
      method="POST"
      action="?/deleteAccount"
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
      <label>
        Password:
        <input type="password" name="password" required />
      </label>

      <button type="submit">Delete account</button>
    </form>
  </Modal>
</section>
