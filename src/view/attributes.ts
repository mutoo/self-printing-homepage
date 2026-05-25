import { escapeHtml } from "../lib/html";
import type { SourceLink } from "../types";

/**
 * Adds new-tab safety attributes for web links.
 * Mail links stay in the current browsing context because opening a mail client
 * is already handled by the browser or operating system.
 */
const externalLinkSafetyAttributes = (href: string): string =>
  href.startsWith("mailto:") ? "" : 'target="_blank" rel="noopener noreferrer"';

/**
 * Renders attributes for a clickable source-code anchor segment.
 * Values are escaped here because this is the final string-building boundary
 * before the markup is mounted into the document.
 */
export const linkAttributes = ({ href, label, accent }: SourceLink): string =>
  [
    `href="${escapeHtml(href)}"`,
    `aria-label="${escapeHtml(`Open ${label}`)}"`,
    externalLinkSafetyAttributes(href),
    `style="--line-accent: ${escapeHtml(accent)}"`
  ]
    .filter(Boolean)
    .join(" ");
