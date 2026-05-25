/**
 * Escapes text before inserting it into generated markup.
 * All visible code starts as raw `index.html`, so escaping is the boundary that
 * lets us display tags as text instead of executing them as real elements.
 */
export const escapeHtml = (value: string): string =>
  value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");

/**
 * Removes nested tags from anchor contents so the accessible label can be plain
 * human-readable text, while the actual displayed line remains untouched.
 */
export const stripTags = (value: string): string =>
  value.replaceAll(/<[^>]*>/g, "").trim();
