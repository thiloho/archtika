import { Marked } from "marked";
import { markedHighlight } from "marked-highlight";
import hljs from "highlight.js";

export const sortOptions = [
  { value: "creation-time", text: "Creation time" },
  { value: "last-modified", text: "Last modified" },
  { value: "title-a-to-z", text: "Title - A to Z" },
  { value: "title-z-to-a", text: "Title - Z to A" }
];

export const ALLOWED_MIME_TYPES = ["image/jpeg", "image/png", "image/svg+xml", "image/webp"];

const createMarkdownParser = () => {
  const marked = new Marked();

  marked.use({
    async: true,
    pedantic: false,
    gfm: true
  });

  marked.use(
    markedHighlight({
      async: true,
      langPrefix: "language-",
      highlight(code, lang) {
        const language = hljs.getLanguage(lang) ? lang : "plaintext";
        return hljs.highlight(code, { language }).value;
      }
    })
  );

  return marked;
};

const marked = createMarkdownParser();

export const md = async (markdownContent: string) => {
  const html = await marked.parse(markdownContent);

  return html;
};

// test

export const handleImagePaste = async (event: ClipboardEvent, API_BASE_PREFIX: string) => {
  const clipboardItems = Array.from(event.clipboardData?.items || []);
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

  const response = await request.json();
  const fileId = JSON.parse(response.data)[1];
  const fileUrl = `${API_BASE_PREFIX}/rpc/retrieve_file?id=${fileId}`;

  const target = event.target as HTMLTextAreaElement;
  const newContent =
    target.value.slice(0, target.selectionStart) +
    `![](${fileUrl})` +
    target.value.slice(target.selectionStart);

  return newContent;
};
