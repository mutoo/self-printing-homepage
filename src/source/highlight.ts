import { join, map, pipe } from "../lib/fp";
import { escapeHtml } from "../lib/html";
import type { SyntaxToken } from "../types";
import { plainTokens, syntaxToken, tokenizeByPattern } from "./tokenizer";

const attributePattern = /([A-Za-z_:][-A-Za-z0-9_:.]*)(=)("[^"]*"|'[^']*')/g;
const tagPattern = /<[^>]*>/g;
const tagFragmentPattern = /^(<\/?|<!)([^\s/>]+)(.*?)(\/?>)$/;
const commentPattern = /<!--[\s\S]*?-->|<!DOCTYPE\b[^>]*>/gi;

/**
 * Tokenizes attributes inside a tag body.
 * Attribute names and quoted values get separate token kinds so CSS can color
 * them differently while equals signs and whitespace remain exact plain text.
 */
const tokenizeAttributes = tokenizeByPattern(
  attributePattern,
  ([, name, equals, quotedValue]) => [
    syntaxToken("attr", name),
    syntaxToken("plain", equals),
    syntaxToken("value", quotedValue)
  ]
);

/**
 * Tokenizes one complete tag-like fragment, such as `<a href="...">`.
 *
 * The regex splits the fragment into opening marker, tag name, inner body, and
 * closing marker. Brackets are intentionally separate from the tag name so `<`
 * and `>` can be rendered in the darker Mutoo angle-bracket color.
 */
const tokenizeTagFragment = (source: string): readonly SyntaxToken[] => {
  const match = source.match(tagFragmentPattern);

  return match
    ? [
        syntaxToken("bracket", match[1]),
        syntaxToken("tag", match[2]),
        ...tokenizeAttributes(match[3]),
        syntaxToken("bracket", match[4])
      ]
    : plainTokens(source);
};

/**
 * Finds tag-like fragments in a source line and tokenizes each one, leaving
 * normal text between tags as plain tokens.
 */
const tokenizeTags = tokenizeByPattern(tagPattern, ([tag]) => tokenizeTagFragment(tag));

/**
 * Finds comment-like fragments before looking for tags.
 * This keeps `<!-- <a> -->` and `<!DOCTYPE html>` opaque instead of
 * accidentally highlighting tag-like text inside them.
 */
const tokenizeComments = tokenizeByPattern(commentPattern, ([comment]) => [
  syntaxToken("comment", comment)
]);

/**
 * Tokenizes a line in two passes.
 *
 * Step 1: carve out full comment fragments.
 * Step 2: tokenize tags only inside the remaining plain fragments.
 * Step 3: keep comment tokens opaque so their internal text is not parsed.
 */
const tokenizeHtml = (source: string): readonly SyntaxToken[] =>
  tokenizeComments(source).flatMap((token) =>
    token.kind === "plain" ? tokenizeTags(token.value) : [token]
  );

/**
 * Converts a token to escaped display markup.
 * Plain tokens stay unwrapped; syntax tokens get a class that CSS can color.
 */
const renderSyntaxToken = ({ kind, value }: SyntaxToken): string =>
  kind === "plain"
    ? escapeHtml(value)
    : `<span class="syntax syntax-${kind}">${escapeHtml(value)}</span>`;

/**
 * Pure line highlighter.
 *
 * Step 1: tokenize the source line as shallow HTML.
 * Step 2: render each token into escaped markup.
 * Step 3: join the fragments back into one highlighted line.
 */
export const highlightHtml = (source: string): string =>
  pipe(source, tokenizeHtml, map(renderSyntaxToken), join(""));
