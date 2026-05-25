/**
 * Raw source file information passed into the pure view renderer.
 * The source text is kept separate from the filename so the renderer can
 * derive the displayed code while still labelling the page accessibly.
 */
export type SourceDocument = Readonly<{
  filename: string;
  source: string;
}>;

/**
 * Link metadata discovered from an anchor line in the source.
 * The homepage does not maintain a separate social-link model; these values
 * are derived from the actual HTML so link behavior stays source-driven.
 */
export type SourceLink = Readonly<{
  href: string;
  label: string;
  accent: string;
}>;

/**
 * Anchor location discovered inside one source line.
 * The start/end range lets rendering restrict the interactive area to the
 * literal `<a ...>...</a>` source span instead of making the whole line a link.
 */
export type SourceAnchor = Readonly<{
  start: number;
  end: number;
  source: string;
  link: SourceLink;
}>;

/**
 * A renderable segment inside one source line.
 * Plain segments and clickable anchor segments are rendered separately so link
 * hit boxes match the original `<a>` tag boundaries.
 */
export type SourceSegment = Readonly<{
  html: string;
  link?: SourceLink;
}>;

/**
 * A single source-code line after pure parsing.
 * Each line is made of one or more segments so only anchor source fragments are
 * interactive while surrounding indentation, `<li>`, or other text stays plain.
 */
export type SourceLine = Readonly<{
  segments: readonly SourceSegment[];
}>;

/**
 * Syntax categories supported by the tiny highlighter.
 * Keeping this list narrow makes the source display predictable and easy to
 * style without pretending to be a complete HTML parser.
 */
export type SyntaxKind = "plain" | "comment" | "bracket" | "tag" | "attr" | "value";

/**
 * A highlighted fragment before it is converted to DOM markup.
 * Tokenization gives the rendering step a small immutable data structure
 * instead of asking it to inspect raw source strings.
 */
export type SyntaxToken = Readonly<{
  kind: SyntaxKind;
  value: string;
}>;

/**
 * Accumulator used by the generic tokenizer.
 * `cursor` marks the next unread character in the source string, and `tokens`
 * contains all emitted syntax fragments so far.
 */
export type TokenizeState = Readonly<{
  cursor: number;
  tokens: readonly SyntaxToken[];
}>;
