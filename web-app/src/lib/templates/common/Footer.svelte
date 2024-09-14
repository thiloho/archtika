<script lang="ts">
  import type { WebsiteOverview } from "../../utils";

  const {
    websiteOverview,
    isIndexPage
  }: { websiteOverview: WebsiteOverview; isIndexPage: boolean } = $props();
</script>

<footer>
  <div class="container">
    <small>
      {@html websiteOverview.footer.additional_text.replace(
        "!!legal",
        `<a href="${isIndexPage ? "./legal-information" : "../legal-information"}">Legal information</a>`
      )}
    </small>
  </div>
</footer>
