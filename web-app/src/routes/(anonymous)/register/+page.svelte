<script lang="ts">
  import { enhance } from "$app/forms";

  const { form } = $props();
</script>

<form method="POST" use:enhance>
  {#if form?.success}
    <p>Successfully registered</p>
  {/if}

  {#if form?.success === false}
    <p>{form.message}</p>
  {/if}

  <label>
    Username
    <input type="text" name="username" minlength="3" maxlength="16" required />
  </label>
  <label>
    Password
    <input type="password" name="password" minlength="12" maxlength="128" required />
  </label>

  <button type="submit">Submit</button>
</form>
