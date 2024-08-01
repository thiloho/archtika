<script lang="ts">
  import { enhance } from "$app/forms";

  const { form } = $props();
</script>

{#if form?.success}
  <p>{form.message}</p>
{/if}

{#if form?.success === false}
  <p>{form.message}</p>
{/if}

<form method="POST" use:enhance>
  <label>
    Username:
    <input type="text" name="username" required />
  </label>
  <label>
    Password:
    <input type="password" name="password" required />
  </label>

  <button type="submit">Submit</button>
</form>
