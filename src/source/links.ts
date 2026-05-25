import { stripTags } from "../lib/html";
import type { SourceAnchor, SourceLink } from "../types";

const linkAccents = ["#4f8cff", "#12a8a8", "#f05d5e", "#d079ff", "#f2b84b"] as const;
const anchorPattern = /<a\s+[^>]*href=(["'])(.*?)\1[^>]*>(.*?)<\/a>/g;
const commentPattern = /<!--[\s\S]*?-->/g;

type SourceRange = Readonly<{
  start: number;
  end: number;
}>;

/**
 * Picks a deterministic accent color from the link's source line position.
 * This keeps colors stable without storing separate social-link state.
 */
const accentAt = (index: number): string => linkAccents[index % linkAccents.length];

/**
 * Converts a successful anchor regex match into link metadata.
 * The href and label are derived from the actual displayed source line, making
 * the source file the single place to update social links.
 */
const sourceLinkFromMatch =
  (lineIndex: number, anchorIndex: number) =>
  (match: RegExpMatchArray): SourceLink => ({
    href: match[2],
    label: stripTags(match[3]),
    accent: accentAt(lineIndex + anchorIndex)
  });

/**
 * Converts a successful anchor regex match into a ranged source anchor.
 * `match[0]` is the exact `<a ...>...</a>` substring that should become
 * clickable, and `match.index` gives the boundary inside the original line.
 */
const sourceAnchorFromMatch =
  (lineIndex: number) =>
  (match: RegExpMatchArray, anchorIndex: number): SourceAnchor => {
    const start = match.index ?? 0;

    return {
      start,
      end: start + match[0].length,
      source: match[0],
      link: sourceLinkFromMatch(lineIndex, anchorIndex)(match)
    };
  };

/**
 * Finds comment ranges so link extraction can ignore anchors written inside
 * comments. That keeps comment recognition semantic, not just visual.
 */
const commentRangesFromLine = (source: string): readonly SourceRange[] =>
  Array.from(source.matchAll(commentPattern)).map((match) => {
    const start = match.index ?? 0;

    return {
      start,
      end: start + match[0].length
    };
  });

/**
 * Checks whether a matched anchor starts inside a comment range.
 */
const startsInsideRange =
  (ranges: readonly SourceRange[]) =>
  (match: RegExpMatchArray): boolean => {
    const start = match.index ?? 0;

    return ranges.some((range) => start >= range.start && start < range.end);
  };

/**
 * Extracts every anchor range from one source line.
 * Multiple anchors on one line are supported, though the current homepage only
 * has one social anchor per line.
 */
export const anchorsFromLine = (source: string, lineIndex: number): readonly SourceAnchor[] => {
  const commentRanges = commentRangesFromLine(source);

  return Array.from(source.matchAll(anchorPattern))
    .filter((match) => !startsInsideRange(commentRanges)(match))
    .map(sourceAnchorFromMatch(lineIndex));
};
