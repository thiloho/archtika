<script lang="ts">
  import { type WebsiteOverview, md } from "../../utils";

  const {
    websiteOverview,
    isIndexPage
  }: { websiteOverview: WebsiteOverview; isIndexPage: boolean } = $props();
</script>

<footer>
  <div class="container">
    <small>
      {@html md(websiteOverview.footer.additional_text, false).replace(
        "!!legal",
        `<a href="${isIndexPage ? "./legal-information" : "../legal-information"}">Legal information</a>`
      )}
    </small>
  </div>
</footer>
