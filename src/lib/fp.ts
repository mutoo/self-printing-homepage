/**
 * Runs a value through a left-to-right chain of pure transformations.
 * The overloads preserve useful TypeScript inference across each step in the
 * pipeline, while the implementation stays tiny and data-first.
 */
export function pipe<A, B>(value: A, ab: (value: A) => B): B;
export function pipe<A, B, C>(value: A, ab: (value: A) => B, bc: (value: B) => C): C;
export function pipe<A, B, C, D>(
  value: A,
  ab: (value: A) => B,
  bc: (value: B) => C,
  cd: (value: C) => D
): D;
export function pipe<A, B, C, D, E>(
  value: A,
  ab: (value: A) => B,
  bc: (value: B) => C,
  cd: (value: C) => D,
  de: (value: D) => E
): E;
export function pipe<A, B, C, D, E, F>(
  value: A,
  ab: (value: A) => B,
  bc: (value: B) => C,
  cd: (value: C) => D,
  de: (value: D) => E,
  ef: (value: E) => F
): F;
export function pipe(value: unknown, ...fns: ReadonlyArray<(value: unknown) => unknown>): unknown {
  return fns.reduce((result, fn) => fn(result), value);
}

/**
 * Curried array mapping helper.
 * This lets pipelines read as "take these values, then map this transform"
 * instead of nesting array calls inside other expressions.
 */
export const map =
  <A, B>(transform: (value: A) => B) =>
  (values: readonly A[]): readonly B[] =>
    values.map(transform);

/**
 * Curried indexed mapping helper for transformations that need stable source
 * positions, such as assigning deterministic accent colors to link lines.
 */
export const mapIndexed =
  <A, B>(transform: (value: A, index: number) => B) =>
  (values: readonly A[]): readonly B[] =>
    values.map(transform);

/**
 * Curried string join helper.
 * Rendering code uses it as the final "collect fragments into markup" step.
 */
export const join =
  (separator: string) =>
  (values: readonly string[]): string =>
    values.join(separator);

/**
 * Appends a suffix only when a source-level condition is true.
 * This is used to preserve a trailing newline exactly when the imported file
 * had one, which keeps the rendered code shape aligned with the source file.
 */
export const appendWhen =
  (condition: boolean, suffix: string) =>
  (value: string): string =>
    condition ? `${value}${suffix}` : value;
