import markdownit from "markdown-it";
import hljs from "highlight.js";
import type { StateCore } from "markdown-it/index.js";
import { dev } from "$app/environment";

export const sortOptions = [
  { value: "creation-time", text: "Creation time" },
  { value: "last-modified", text: "Last modified" },
  { value: "title-a-to-z", text: "Title - A to Z" },
  { value: "title-z-to-a", text: "Title - Z to A" }
];

export const ALLOWED_MIME_TYPES = ["image/jpeg", "image/png", "image/svg+xml", "image/webp"];

export const md = markdownit({
  linkify: true,
  typographer: true,
  highlight: (str: string, lang: string) => {
    if (lang && hljs.getLanguage(lang)) {
      try {
        return hljs.highlight(str, { language: lang }).value;
      } catch (_) {}
    }
    return "";
  }
}).use((md) => {
  const addSections = (state: StateCore) => {
    const tokens = [];
    const Token = state.Token;
    const sections: { header: number; nesting: number }[] = [];
    let nestedLevel = 0;

    const slugify = (text: string) => {
      return text
        .toLowerCase()
        .replace(/\s+/g, "-")
        .replace(/[^\w-]+/g, "")
        .replace(/--+/g, "-")
        .replace(/^-+/, "")
        .replace(/-+$/, "");
    };

    const openSection = (attrs: [string, string][] | null, headingText: string) => {
      const t = new Token("section_open", "section", 1);
      t.block = true;
      t.attrs = attrs ? attrs.map((attr) => [attr[0], attr[1]]) : [];
      t.attrs.push(["id", slugify(headingText)]);
      return t;
    };

    const closeSection = () => {
      const t = new Token("section_close", "section", -1);
      t.block = true;
      return t;
    };

    const closeSections = (section: { header: number; nesting: number }) => {
      while (sections.length && section.header <= sections[sections.length - 1].header) {
        sections.pop();
        tokens.push(closeSection());
      }
    };

    const closeSectionsToCurrentNesting = (nesting: number) => {
      while (sections.length && nesting < sections[sections.length - 1].nesting) {
        sections.pop();
        tokens.push(closeSection());
      }
    };

    const closeAllSections = () => {
      while (sections.pop()) {
        tokens.push(closeSection());
      }
    };

    for (let i = 0; i < state.tokens.length; i++) {
      const token = state.tokens[i];
      if (token.type.search("heading") !== 0) {
        nestedLevel += token.nesting;
      }
      if (sections.length && nestedLevel < sections[sections.length - 1].nesting) {
        closeSectionsToCurrentNesting(nestedLevel);
      }

      if (token.type === "heading_open") {
        const section: { header: number; nesting: number } = {
          header: parseInt(token.tag.charAt(1)),
          nesting: nestedLevel
        };
        if (sections.length && section.header <= sections[sections.length - 1].header) {
          closeSections(section);
        }

        const headingTextToken = state.tokens[i + 1];
        const headingText = headingTextToken.content;

        tokens.push(openSection(token.attrs, headingText));
        const idIndex = token.attrIndex("id");
        if (idIndex !== -1) {
          token.attrs?.splice(idIndex, 1);
        }
        sections.push(section);
      }

      tokens.push(token);
    }
    closeAllSections();

    state.tokens = tokens;
  };

  md.core.ruler.push("header_sections", addSections);
});

export const handleImagePaste = async (event: ClipboardEvent) => {
  const clipboardItems = Array.from(event.clipboardData?.items || []);
  const file = clipboardItems.find((item) => item.type.startsWith("image/"));

  if (!file) return;

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

export const API_BASE_PREFIX = dev ? "http://localhost:3000" : `${import.meta.env.PUBLIC_ORIGIN}/api`;
export const NGINX_BASE_PREFIX = dev ? "http://localhost:18000" : "";
