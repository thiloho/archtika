<script lang="ts">
  import { enhance } from "$app/forms";
  import SuccessOrError from "$lib/components/SuccessOrError.svelte";
  import type { ActionData } from "./$types";
  import LoadingSpinner from "$lib/components/LoadingSpinner.svelte";

  const { form }: { form: ActionData } = $props();

  let sending = $state(false);
  let loadingDelay: number;
</script>

<SuccessOrError success={form?.success} message={form?.message} />

{#if sending}
  <LoadingSpinner />
{/if}

<form
  method="POST"
  use:enhance={() => {
    loadingDelay = window.setTimeout(() => (sending = true), 500);
    return async ({ update }) => {
      await update();
      window.clearTimeout(loadingDelay);
      sending = false;
    };
  }}
>
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
