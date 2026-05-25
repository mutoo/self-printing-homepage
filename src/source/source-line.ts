import { highlightHtml } from "./highlight";
import { anchorsFromLine } from "./links";
import { escapeHtml } from "../lib/html";
import type { SourceAnchor, SourceLine, SourceSegment } from "../types";

const hrefSourceAttributePattern = /(\s*)\bhref=(["'])(.*?)\2/;

/**
 * Builds a non-clickable segment from raw source text.
 * Empty ranges are ignored by `segmentsFromAnchors`, so this helper only deals
 * with meaningful visible source fragments.
 */
const plainSegment = (source: string): SourceSegment => ({
  html: highlightHtml(source)
});

/**
 * Builds a clickable segment from an anchor range.
 * The real href remains in `link`, while the visible source wraps the href
 * attribute so small screens can hide just that noisy substring.
 */
const anchorSegment = ({ source, link }: SourceAnchor): SourceSegment => ({
  html: highlightAnchorSource(source),
  link
});

const renderHighlightedHrefAttribute = (
  [, whitespace, quote, value]: RegExpMatchArray
): string =>
  `${escapeHtml(whitespace)}` +
  `<span class="syntax syntax-attr">href</span>=` +
  `<span class="syntax syntax-value">${escapeHtml(`${quote}${value}${quote}`)}</span>`;

/**
 * Keeps the desktop source exact, but marks the href attribute as a display
 * unit. CSS can then remove it on mobile without changing link behavior.
 */
const highlightAnchorSource = (source: string): string => {
  const match = source.match(hrefSourceAttributePattern);

  if (!match) {
    return highlightHtml(source);
  }

  const highlightedHref = renderHighlightedHrefAttribute(match);

  return highlightHtml(source).replace(
    highlightedHref,
    `<span class="source-href">${highlightedHref}</span>`
  );
};

/**
 * Emits a segment only when the source slice has visible length.
 * This avoids adding empty spans around anchors at the start or end of a line.
 */
const segmentWhenPresent = (source: string): readonly SourceSegment[] =>
  source.length === 0 ? [] : [plainSegment(source)];

/**
 * Splits a line into plain and anchor segments.
 *
 * Step 1: keep plain source before the current anchor.
 * Step 2: keep the anchor source as a clickable, URL-masked segment.
 * Step 3: recurse from the end of the anchor until no anchors remain.
 */
const segmentsFromAnchors = (
  line: string,
  anchors: readonly SourceAnchor[]
): readonly SourceSegment[] => {
  const [anchor, ...rest] = anchors;

  return anchor
    ? [
        ...segmentWhenPresent(line.slice(0, anchor.start)),
        anchorSegment(anchor),
        ...segmentsFromAnchors(line.slice(anchor.end), shiftAnchors(-anchor.end, rest))
      ]
    : segmentWhenPresent(line);
};

/**
 * Re-bases remaining anchor ranges after the already-rendered prefix has been
 * sliced away. This keeps the recursive split free of mutable cursor state.
 */
const shiftAnchors =
  (offset: number, anchors: readonly SourceAnchor[]): readonly SourceAnchor[] =>
    anchors.map((anchor) => ({
      ...anchor,
      start: anchor.start + offset,
      end: anchor.end + offset
    }));

/**
 * Enriches one raw source line for rendering.
 *
 * Step 1: derive anchor ranges from the raw line.
 * Step 2: split the line into plain and clickable segments.
 *
 * The raw text remains authoritative for behavior; this function adds render
 * metadata and display masking.
 */
export const sourceLineFromText = (line: string, index: number): SourceLine => ({
  segments: segmentsFromAnchors(line, anchorsFromLine(line, index))
});
