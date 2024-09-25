<script lang="ts">
  import { enhance } from "$app/forms";
  import SuccessOrError from "$lib/components/SuccessOrError.svelte";
  import type { ActionData, PageServerData } from "./$types";
  import LoadingSpinner from "$lib/components/LoadingSpinner.svelte";

  const { data, form }: { data: PageServerData; form: ActionData } = $props();

  let sending = $state(false);
  let loadingDelay: number;
</script>

<SuccessOrError success={form?.success} message={form?.message} />

{#if sending}
  <LoadingSpinner />
{/if}

{#if data.REGISTRATION_IS_DISABLED}
  <p class="registration-disabled">
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 20 20"
      fill="currentColor"
      width="20"
      height="20"
      color="var(--color-error)"
    >
      <path
        fill-rule="evenodd"
        d="M10 1a4.5 4.5 0 0 0-4.5 4.5V9H5a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-6a2 2 0 0 0-2-2h-.5V5.5A4.5 4.5 0 0 0 10 1Zm3 8V5.5a3 3 0 1 0-6 0V9h6Z"
        clip-rule="evenodd"
      ></path>
    </svg>
    Account registration is disabled on this instance
  </p>
{:else}
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
      <input type="text" name="username" minlength="3" maxlength="16" required />
    </label>
    <label>
      Password:
      <input type="password" name="password" minlength="12" maxlength="128" required />
    </label>

    <button type="submit">Submit</button>
  </form>
{/if}

<style>
  .registration-disabled {
    display: flex;
    gap: 0.5rem;
    align-items: center;
  }
</style>
