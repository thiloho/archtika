<script lang="ts">
  import { enhance } from "$app/forms";
  import Modal from "$lib/components/Modal.svelte";

  const { data, form } = $props();
</script>

{#if form?.success}
  <p>{form.message}</p>
{/if}

{#if form?.success === false}
  <p>{form.message}</p>
{/if}

<section>
  <h2>Overview</h2>

  <p>
    <strong>Username:</strong>
    {data.user.username}
  </p>
  <p>
    <strong>ID:</strong>
    {data.user.id}
  </p>
</section>

<section>
  <h2>Logout</h2>

  <form method="POST" action="?/logout" use:enhance>
    <button type="submit">Logout</button>
  </form>
</section>

<section>
  <h2>Delete account</h2>

  <Modal id="delete-account" text="Delete account">
    <h3>Delete account</h3>

    <p>
      <strong>Caution!</strong>
      Deleting your account will irretrievably erase all data.
    </p>

    <form method="POST" action="?/deleteAccount" use:enhance>
      <label>
        Password:
        <input type="password" name="password" required />
      </label>

      <button type="submit">Permanently delete account</button>
    </form>
  </Modal>
</section>
