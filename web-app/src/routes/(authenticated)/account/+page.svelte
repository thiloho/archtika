<script lang="ts">
  import { enhance } from "$app/forms";
  import Modal from "$lib/components/Modal.svelte";
  import SuccessOrError from "$lib/components/SuccessOrError.svelte";

  const { data, form } = $props();
</script>

<SuccessOrError success={form?.success} message={form?.message} />

<section>
  <h2>Overview</h2>

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

    <form
      method="POST"
      action="?/deleteAccount"
      use:enhance={() => {
        return async ({ update }) => {
          await update();
          window.location.hash = "!";
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
