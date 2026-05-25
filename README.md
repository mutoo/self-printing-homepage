# Self-printing homepage

A small personal homepage that renders itself as readable HTML source code.

The browser loads `public/index.html`, then the compiled TypeScript reads that same
HTML file as text, highlights it, masks each visible `href` as `href="..."`, and
turns only the displayed `<a ...>...</a>` fragments into real links.

![Self-printing homepage screenshot](./docs/screenshot.png)

## Features

- Self-printing homepage: the page displays its own `public/index.html` source.
- TypeScript implementation with a functional transformation pipeline.
- Isolated side effect: DOM mounting happens only in `src/effects.ts`.
- Syntax highlighting for comments, doctype, tag brackets, tag names, attributes, and values.
- Links open in a new tab at runtime, while the visible source keeps `href="..."`.
- Responsive mobile layout with wrapped source code instead of horizontal clipping.
- Static output in `public/`: `index.html`, `main.js`, and `main.css`.

## Project Structure

```text
public/
  index.html      Static entry point and source displayed by the app
  main.css        Generated stylesheet bundle
  main.js         Generated JavaScript bundle

src/
  main.ts         App entry, imports public/index.html as text
  effects.ts      DOM side-effect boundary
  view/           Source-code rendering
  source/         Line parsing, highlighting, and link extraction
  lib/            Small FP and HTML helpers
  styles.css      Source stylesheet bundled into public/main.css
```

## Development

Install dependencies:

```sh
npm install
```

Run the local server:

```sh
npm run dev
```

Build the static assets:

```sh
npm run build
```

Preview the built site:

```sh
npm run preview
```

## Build System

The build uses TypeScript for type checking and esbuild for bundling:

```sh
npm run typecheck
npm run bundle
```

`src/main.ts` imports `../public/index.html` as text through esbuild's HTML text
loader. The output is written directly to `public/main.js` and `public/main.css`,
so `public/index.html` can stay a plain static entry point.

## License

MIT
