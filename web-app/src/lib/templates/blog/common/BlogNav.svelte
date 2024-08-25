<script lang="ts">
  const { logoType, logo }: { logoType: "text" | "image"; logo: string } = $props();
</script>

<nav>
  <div class="container">
    <a href="../">
      {#if logoType === "text"}
        <p>
          <strong>{logo}</strong>
        </p>
      {:else}
        <img src={logo} width="24" height="24" alt="" />
      {/if}
    </a>
  </div>
</nav>
