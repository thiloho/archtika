<script lang="ts">
  import { enhance } from "$app/forms";
  import SuccessOrError from "$lib/components/SuccessOrError.svelte";
  import type { ActionData } from "./$types";

  const { form } = $props<{ form: ActionData }>();
</script>

<SuccessOrError success={form?.success} message={form?.message} />

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
