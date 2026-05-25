/**
 * Splits source text into display lines without manufacturing an extra blank
 * line for a trailing newline. The newline itself is restored later so the
 * rendered code keeps the same line shape as the file.
 */
export const visibleLines = (source: string): readonly string[] =>
  (source.endsWith("\n") ? source.slice(0, -1) : source).split("\n");
