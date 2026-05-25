import { appendWhen, join, mapIndexed, pipe } from "../lib/fp";
import { sourceLineFromText } from "../source/source-line";
import { visibleLines } from "../source/lines";
import type { SourceLine, SourceSegment } from "../types";
import { linkAttributes } from "./attributes";

/**
 * Renders a clickable source segment.
 * Only the anchor substring becomes a real link, so adjacent indentation or
 * wrapper tags stay outside the hit area.
 */
const renderLinkedSegment = (segment: SourceSegment & { link: NonNullable<SourceSegment["link"]> }): string =>
  `<a class="code-link" ${linkAttributes(segment.link)}>${segment.html}</a>`;

/**
 * Renders a non-clickable source segment.
 * The segment is already syntax-highlighted, so it can be returned directly.
 */
const renderPlainSegment = ({ html }: SourceSegment): string => html;

/**
 * Chooses the correct segment renderer based on whether anchor metadata was
 * derived from the original source substring.
 */
const renderSegment = (segment: SourceSegment): string =>
  segment.link ? renderLinkedSegment({ ...segment, link: segment.link }) : renderPlainSegment(segment);

/**
 * Renders one source line as a stable row while preserving segment boundaries.
 */
const renderLine = ({ segments }: SourceLine, index: number): string =>
  `<span class="code-line" style="--line-index: ${index}">` +
  `${segments.map(renderSegment).join("")}</span>`;

/**
 * Converts an entire source file into highlighted, clickable code markup.
 *
 * Step 1: split the source into visible lines.
 * Step 2: enrich each line with syntax markup and optional link metadata.
 * Step 3: render each enriched line to markup.
 * Step 4: join lines with newline characters so the view keeps source shape.
 * Step 5: restore the trailing newline if the imported source had one.
 */
export const renderSource = (source: string): string =>
  pipe(
    source,
    visibleLines,
    mapIndexed(sourceLineFromText),
    mapIndexed(renderLine),
    join("\n"),
    appendWhen(source.endsWith("\n"), "\n")
  );
