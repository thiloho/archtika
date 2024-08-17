import markdownit from "markdown-it";
import hljs from "highlight.js";
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
  highlight: (str, lang) => {
    if (lang && hljs.getLanguage(lang)) {
      try {
        return hljs.highlight(str, { language: lang }).value;
      } catch (_) {}
    }

    return "";
  }
});

export const API_BASE_PREFIX = dev ? "http://localhost:3000" : "/api";
export const NGINX_BASE_PREFIX = dev ? "http://localhost:18000" : "";
