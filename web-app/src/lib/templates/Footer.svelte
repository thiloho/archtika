<script lang="ts">
  import { type WebsiteOverview, md } from "../utils";

  const { websiteOverview }: { websiteOverview: WebsiteOverview } = $props();
</script>

<footer>
  <div class="container">
    {@html md(websiteOverview.footer.additional_text, false)}
  </div>
</footer>
