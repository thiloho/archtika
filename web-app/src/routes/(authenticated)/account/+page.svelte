<script lang="ts">
  import { enhance } from "$app/forms";

  const { data, form } = $props();
</script>

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

  {#if form?.logout?.success}
    <p>Successfully logged out</p>
  {/if}

  <form method="POST" action="?/logout" use:enhance>
    <button type="submit">Logout</button>
  </form>
</section>

<section>
  <h2>Delete account</h2>

  {#if form?.deleteAccount?.success}
    <p>Account was deleted</p>
  {/if}

  {#if form?.deleteAccount?.success === false}
    <p>{form.deleteAccount.message}</p>
  {/if}

  <form method="POST" action="?/deleteAccount" use:enhance>
    <label>
      Password
      <input type="password" name="password" required />
    </label>

    <button type="submit">Delete account</button>
  </form>
</section>
