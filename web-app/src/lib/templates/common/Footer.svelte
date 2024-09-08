<script lang="ts">
  const { text, isIndexPage = true }: { text: string; isIndexPage?: boolean } = $props();
</script>

<footer>
  <div class="container">
    <small>
      {@html text.replace(
        "!!legal",
        `<a href="${isIndexPage ? "./legal-information" : "../legal-information"}">Legal information</a>`
      )}
    </small>
  </div>
</footer>
