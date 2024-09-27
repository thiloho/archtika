<script lang="ts">
  import { deserialize, applyAction } from "$app/forms";
  import { textareaScrollTop, previewContent } from "$lib/runes.svelte";

  const {
    apiPrefix,
    label,
    name,
    content
  }: { apiPrefix: string; label: string; name: string; content: string } = $props();

  let mainContentTextarea: HTMLTextAreaElement;

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
      const newContent =
        target.value.slice(0, target.selectionStart) +
        `![](${fileUrl})` +
        target.value.slice(target.selectionStart);

      previewContent.value = newContent;
    } else {
      return;
    }
  };
</script>

<label>
  {label}:
  <textarea
    {name}
    rows="20"
    bind:value={previewContent.value}
    bind:this={mainContentTextarea}
    onscroll={updateScrollPercentage}
    onpaste={handleImagePaste}
    required>{content}</textarea
  >
</label>
