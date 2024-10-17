<script lang="ts">
  import { enhance } from "$app/forms";
  import SuccessOrError from "$lib/components/SuccessOrError.svelte";
  import type { ActionData, PageServerData } from "./$types";
  import LoadingSpinner from "$lib/components/LoadingSpinner.svelte";
  import { sending } from "$lib/runes.svelte";
  import { enhanceForm } from "$lib/utils";

  const { data, form }: { data: PageServerData; form: ActionData } = $props();
</script>

<SuccessOrError success={form?.success} message={form?.message} />

{#if sending.value}
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
    Registration is disabled
  </p>
{:else}
  <div class="registration-wrapper">
    <form method="POST" use:enhance={enhanceForm()}>
      <label>
        Username:
        <input
          type="text"
          name="username"
          minlength="3"
          maxlength="16"
          pattern="^[a-zA-Z0-9_\-]+$"
          required
        />
      </label>
      <label>
        Password:
        <input type="password" name="password" minlength="12" maxlength="128" required />
      </label>

      <button type="submit">Submit</button>
    </form>

    <details>
      <summary>Password requirements</summary>
      <ul>
        <li>Must be between 12 and 128 characters long</li>
        <li>Must contain at least one lowercase letter</li>
        <li>Must contain at least one uppercase letter</li>
        <li>Must contain at least one number</li>
        <li>Must contain at least one special character</li>
      </ul>
    </details>
  </div>
{/if}

<style>
  .registration-disabled {
    display: flex;
    gap: var(--space-2xs);
    align-items: center;
  }

  .registration-wrapper {
    display: flex;
    flex-wrap: wrap;
    gap: var(--space-l);
  }

  .registration-wrapper > form {
    inline-size: 30ch;
    flex-grow: 1;
  }

  .registration-wrapper > details {
    inline-size: 35ch;
  }

  @media (max-width: 700px) {
    .registration-wrapper > form {
      order: 1;
    }
  }
</style>
