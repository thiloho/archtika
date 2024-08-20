<script lang="ts">
  import { enhance } from "$app/forms";
  import SuccessOrError from "$lib/components/SuccessOrError.svelte";
  import type { ActionData } from "./$types";

  const { form }: { form: ActionData } = $props();
</script>

<SuccessOrError success={form?.success} message={form?.message} />

<form method="POST" use:enhance>
  <label>
    Username:
    <input type="text" name="username" minlength="3" maxlength="16" required />
  </label>
  <label>
    Password:
    <input type="password" name="password" minlength="12" maxlength="128" required />
  </label>

  <button type="submit">Submit</button>
</form>
