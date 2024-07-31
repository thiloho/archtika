<script lang="ts">
  import { enhance } from "$app/forms";

  const { form } = $props();
</script>

<form method="POST" use:enhance>
  {#if form?.success}
    <p>Successfully logged in</p>
  {/if}

  {#if form?.success === false}
    <p>{form.message}</p>
  {/if}

  <label>
    Username
    <input type="text" name="username" required />
  </label>
  <label>
    Password
    <input type="password" name="password" required />
  </label>

  <button type="submit">Submit</button>
</form>
