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
import type { SubmitFunction } from "@sveltejs/kit";
import { sending } from "./runes.svelte";

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

export const LOADING_DELAY = 500;
let loadingDelay: number;

export const enhanceForm = (options?: {
  reset?: boolean;
  closeModal?: boolean;
}): SubmitFunction => {
  return () => {
    loadingDelay = window.setTimeout(() => (sending.value = true), LOADING_DELAY);

    return async ({ update }) => {
      await update({ reset: options?.reset ?? true });
      window.clearTimeout(loadingDelay);
      if (options?.closeModal) {
        window.location.hash = "!";
      }
      sending.value = false;
    };
  };
};

export const hexToHSL = (hex: string) => {
  const r = parseInt(hex.slice(1, 3), 16) / 255;
  const g = parseInt(hex.slice(3, 5), 16) / 255;
  const b = parseInt(hex.slice(5, 7), 16) / 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const d = max - min;

  let h = 0;
  const l = (max + min) / 2;
  const s = d === 0 ? 0 : d / (1 - Math.abs(2 * l - 1));

  if (d !== 0) {
    switch (max) {
      case r:
        h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
        break;
      case g:
        h = ((b - r) / d + 2) / 6;
        break;
      case b:
        h = ((r - g) / d + 4) / 6;
        break;
    }
  }

  return {
    h: Math.round(h * 360),
    s: Math.round(s * 100),
    l: Math.round(l * 100)
  };
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
