<script lang="ts">
  const {
    logoType,
    logo,
    isDocsTemplate = false
  }: {
    logoType: "text" | "image";
    logo: string;
    isDocsTemplate?: boolean;
  } = $props();
</script>

<nav>
  <div class="container">
    {#if isDocsTemplate}
      <input type="checkbox" id="toggle-sidebar" hidden />
      <label for="toggle-sidebar">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 20 20"
          fill="currentColor"
          width="20"
          height="20"
        >
          <path
            fill-rule="evenodd"
            d="M2 4.75A.75.75 0 0 1 2.75 4h14.5a.75.75 0 0 1 0 1.5H2.75A.75.75 0 0 1 2 4.75ZM2 10a.75.75 0 0 1 .75-.75h14.5a.75.75 0 0 1 0 1.5H2.75A.75.75 0 0 1 2 10Zm0 5.25a.75.75 0 0 1 .75-.75h14.5a.75.75 0 0 1 0 1.5H2.75a.75.75 0 0 1-.75-.75Z"
            clip-rule="evenodd"
          ></path>
        </svg>
      </label>

      <ul class="docs-navigation">
        <li>nav comes here</li>
      </ul>
    {/if}
    <a href="../">
      {#if logoType === "text"}
        <strong>{logo}</strong>
      {:else}
        <img src={logo} width="24" height="24" alt="" />
      {/if}
    </a>
  </div>
</nav>
