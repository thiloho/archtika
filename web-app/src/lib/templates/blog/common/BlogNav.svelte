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
        <img src={logo} alt="" />
      {/if}
    </a>
  </div>
</nav>
