/* eslint-disable @typescript-eslint/no-explicit-any */

import DOMPurify from "dompurify";
import MarkdownIt from "markdown-it";

// Configure Markdown-It once
const md = new MarkdownIt({
  html: false,        // don't allow raw HTML from model
  linkify: true,
  breaks: true,
});

export default function SafeMarkdown({ markdown }: { markdown?: string }) {
  if (!markdown) return null;
  const html = md.render(markdown);
  const clean = DOMPurify.sanitize(html, {
    USE_PROFILES: { html: true }, // safe default profile
  });

  return (
    <article
      className="prose prose-slate max-w-none"
      dangerouslySetInnerHTML={{ __html: clean }}
    />
  );
}
