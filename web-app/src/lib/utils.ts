import { Marked } from "marked";
import type { Renderer, Token } from "marked";
import { markedHighlight } from "marked-highlight";
import hljs from "highlight.js";
import DOMPurify from "isomorphic-dompurify";
import { applyAction, deserialize } from "$app/forms";
import type {
  Website,
  Settings,
  Header,
  Home,
  Footer,
  Article,
  DocsCategory,
  LegalInformation,
  DomainPrefix
} from "$lib/db-schema";

export const ALLOWED_MIME_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/avif",
  "image/gif",
  "image/svg+xml"
];

export const slugify = (string: string) => {
  return string
    .toString()
    .normalize("NFKD") // Normalize Unicode characters
    .toLowerCase() // Convert to lowercase
    .trim() // Trim leading and trailing whitespace
    .replace(/\s+/g, "-") // Replace spaces with hyphens
    .replace(/[^\w-]+/g, "") // Remove non-word characters (except hyphens)
    .replace(/-+/g, "-") // Replace multiple hyphens with single hyphen
    .replace(/^-+/, "") // Remove leading hyphens
    .replace(/-+$/, ""); // Remove trailing hyphens
};

const createMarkdownParser = (showToc = true) => {
  const marked = new Marked();

  marked.use({
    async: false,
    pedantic: false,
    gfm: true
  });

  marked.use(
    markedHighlight({
      async: false,
      langPrefix: "language-",
      highlight(code, lang) {
        const language = hljs.getLanguage(lang) ? lang : "plaintext";
        return hljs.highlight(code, { language }).value;
      }
    })
  );

  const gfmHeadingId = ({ prefix = "", showToc = true } = {}) => {
    const headings: { text: string; level: number; id: string }[] = [];
    const sectionStack: { level: number; id: string }[] = [];

    return {
      renderer: {
        heading(this: Renderer, { tokens, depth }: { tokens: Token[]; depth: number }) {
          const text = this.parser.parseInline(tokens);
          const level = depth;
          const id = `${prefix}${slugify(text)}`;
          const heading = { level, text, id };
          headings.push(heading);

          let closingSections = "";
          while (sectionStack.length > 0 && sectionStack[sectionStack.length - 1].level >= level) {
            sectionStack.pop();
            closingSections += "</section>";
          }

          sectionStack.push({ level, id });
          const openingSection = `<section id="${id}">`;

          return `
            ${closingSections}
            ${openingSection}
            <h${level}>
              <a href="#${id}">${text}</a>
            </h${level}>
          `;
        }
      },
      hooks: {
        postprocess(html: string) {
          let tableOfContents = "";
          if (showToc && headings.length > 0) {
            const tocItems = [];
            let currentLevel = 0;

            for (const { id, text, level } of headings) {
              while (currentLevel < level - 1) {
                tocItems.push("<ul>");
                currentLevel++;
              }
              while (currentLevel > level - 1) {
                tocItems.push("</ul>");
                currentLevel--;
              }
              tocItems.push(`<li><a href="#${id}">${text}</a>`);
              if (level > currentLevel) {
                tocItems.push("<ul>");
                currentLevel = level;
              } else {
                tocItems.push("</li>");
              }
            }

            while (currentLevel > 0) {
              tocItems.push("</ul></li>");
              currentLevel--;
            }

            tableOfContents = `
              <section id="table-of-contents">
                <h2>
                  <a href="#table-of-contents">Table of contents</a>
                </h2>
                ${tocItems.join("")}
              </section>
            `;
          }

          return `
            ${tableOfContents}
            ${html}
            ${"</section>".repeat(sectionStack.length)}
          `;
        }
      }
    };
  };

  marked.use(gfmHeadingId({ showToc: showToc }));

  return marked;
};

export const md = (markdownContent: string, showToc = true) => {
  const marked = createMarkdownParser(showToc);
  const html = DOMPurify.sanitize(marked.parse(markdownContent) as string);

  return html;
};

export const handleImagePaste = async (event: ClipboardEvent, API_BASE_PREFIX: string) => {
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
    const fileId = JSON.parse(response.data)[3];
    const fileUrl = `${API_BASE_PREFIX}/rpc/retrieve_file?id=${fileId}`;

    const target = event.target as HTMLTextAreaElement;
    const newContent =
      target.value.slice(0, target.selectionStart) +
      `![](${fileUrl})` +
      target.value.slice(target.selectionStart);

    return newContent;
  } else {
    return "";
  }
};

export interface WebsiteOverview extends Website {
  settings: Settings;
  header: Header;
  home: Home;
  footer: Footer;
  article: (Article & { docs_category: DocsCategory | null })[];
  legal_information?: LegalInformation;
  domain_prefix?: DomainPrefix;
}
