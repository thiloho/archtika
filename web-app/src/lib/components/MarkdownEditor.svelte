<script lang="ts">
  import { deserialize, applyAction } from "$app/forms";
  import { textareaScrollTop, previewContent } from "$lib/runes.svelte";
  import LoadingSpinner from "$lib/components/LoadingSpinner.svelte";
  import { LOADING_DELAY } from "$lib/utils";

  const {
    apiPrefix,
    label,
    name,
    content
  }: { apiPrefix: string; label: string; name: string; content: string } = $props();

  let mainContentTextarea: HTMLTextAreaElement;
  let loadingDelay: number;
  let pasting = $state(false);

  const updateScrollPercentage = () => {
    const { scrollTop, scrollHeight, clientHeight } = mainContentTextarea;
    textareaScrollTop.value = (scrollTop / (scrollHeight - clientHeight)) * 100;
  };

  const handleImagePaste = async (event: ClipboardEvent) => {
    const clipboardItems = Array.from(event.clipboardData?.items ?? []);
    const file = clipboardItems.find((item) => item.type.startsWith("image/"));

    if (!file) return null;

    event.preventDefault();

    const fileObject = file.getAsFile();

    if (!fileObject) return;

    loadingDelay = window.setTimeout(() => (pasting = true), LOADING_DELAY);

    const formData = new FormData();
    formData.append("file", fileObject);

    const request = await fetch("?/pasteImage", {
      method: "POST",
      body: formData
    });

    const result = deserialize(await request.clone().text());
    applyAction(result);

    const response = await request.json();

    if (JSON.parse(response.data)[1]) {
      const fileId = JSON.parse(response.data)[4];
      const fileUrl = `${apiPrefix}/rpc/retrieve_file?id=${fileId}`;

      const target = event.target as HTMLTextAreaElement;
      const markdownToInsert = `![](${fileUrl})`;
      const cursorPosition = target.selectionStart;
      const newContent =
        target.value.slice(0, cursorPosition) +
        markdownToInsert +
        target.value.slice(cursorPosition);

      target.value = newContent;
      previewContent.value = newContent;

      const newCursorPosition = cursorPosition + markdownToInsert.length;
      target.setSelectionRange(newCursorPosition, newCursorPosition);
      target.focus();
    }

    window.clearTimeout(loadingDelay);
    pasting = false;
    return;
  };
</script>

{#if pasting}
  <LoadingSpinner />
{/if}

<label>
  {label}:
  <textarea
    {name}
    rows="20"
    maxlength="200000"
    bind:value={previewContent.value}
    bind:this={mainContentTextarea}
    onscroll={updateScrollPercentage}
    onpaste={handleImagePaste}
    required>{content}</textarea
  >
</label>
