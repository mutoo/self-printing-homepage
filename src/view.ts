import { escapeHtml } from "./lib/html";
import type { SourceDocument } from "./types";
import { renderSource } from "./view/source-code";

/**
 * Builds the complete homepage markup from a source document.
 * This remains pure: it returns a string and leaves DOM writes to `effects.ts`.
 */
export const renderHomepage = ({ filename, source }: SourceDocument): string => `
  <main class="source-page" aria-label="${escapeHtml(filename)} source code">
    <pre class="source-code"><code>${renderSource(source)}</code></pre>
  </main>
`;
