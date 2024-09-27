<script lang="ts">
  import { enhance } from "$app/forms";
  import SuccessOrError from "$lib/components/SuccessOrError.svelte";
  import type { ActionData } from "./$types";
  import LoadingSpinner from "$lib/components/LoadingSpinner.svelte";
  import { sending } from "$lib/runes.svelte";
  import { enhanceForm } from "$lib/utils";

  const { form }: { form: ActionData } = $props();
</script>

<SuccessOrError success={form?.success} message={form?.message} />

{#if sending.value}
  <LoadingSpinner />
{/if}

<form method="POST" use:enhance={enhanceForm()}>
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
