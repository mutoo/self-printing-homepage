import type { SyntaxKind, SyntaxToken, TokenizeState } from "../types";

/**
 * Creates a syntax token. Keeping construction behind this helper makes token
 * arrays easy to scan and keeps each tokenizer focused on structure.
 */
export const syntaxToken = (kind: SyntaxKind, value: string): SyntaxToken => ({ kind, value });

/**
 * Wraps unmatched source text as plain tokens.
 * Empty strings produce no token so downstream rendering never has to filter
 * out meaningless fragments.
 */
export const plainTokens = (value: string): readonly SyntaxToken[] =>
  value.length === 0 ? [] : [syntaxToken("plain", value)];

/**
 * Builds a reusable tokenizer from a regex and a match-to-token function.
 *
 * Step 1: collect every regex match in source order.
 * Step 2: use `cursor` to emit untouched text between matches as plain tokens.
 * Step 3: convert the matched fragment into syntax tokens.
 * Step 4: append any remaining text after the final match.
 *
 * The reducer returns a new state object at each step, keeping the tokenizer
 * immutable while still preserving exact source ordering.
 */
export const tokenizeByPattern =
  (
    pattern: RegExp,
    tokenizeMatch: (match: RegExpMatchArray) => readonly SyntaxToken[]
  ) =>
  (source: string): readonly SyntaxToken[] => {
    // The cursor starts before the first character; no tokens have been emitted.
    const initialState: TokenizeState = { cursor: 0, tokens: [] };

    // Each match advances the cursor and appends the plain gap plus tokenized match.
    const finalState = Array.from(source.matchAll(pattern)).reduce<TokenizeState>(
      (state, match) => {
        const matchStart = match.index ?? state.cursor;
        const matchEnd = matchStart + match[0].length;

        return {
          cursor: matchEnd,
          tokens: [
            ...state.tokens,
            ...plainTokens(source.slice(state.cursor, matchStart)),
            ...tokenizeMatch(match)
          ]
        };
      },
      initialState
    );

    // Anything after the final match remains visible source text, so keep it plain.
    return [...finalState.tokens, ...plainTokens(source.slice(finalState.cursor))];
  };
