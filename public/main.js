// src/effects.ts
var currentPageSourceUrl = () => {
  const url = new URL(window.location.href);
  url.hash = "";
  return url.href;
};
var fetchCurrentPageSource = async () => {
  const response = await fetch(currentPageSourceUrl());
  if (!response.ok) {
    throw new Error(
      `Failed to fetch current page source: ${response.status} ${response.statusText}`
    );
  }
  return response.text();
};
var revealBody = () => {
  document.body.removeAttribute("data-cloak");
};
var appElement = (mountId) => {
  const mount = document.getElementById(mountId);
  if (!mount) {
    throw new Error(`Missing mount element: #${mountId}`);
  }
  return mount;
};
var revealPage = () => {
  revealBody();
};
var mountApp = (mountId, markup) => {
  const mount = appElement(mountId);
  mount.innerHTML = markup;
  revealBody();
};

// src/lib/html.ts
var escapeHtml = (value) => value.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;").replaceAll("'", "&#039;");
var stripTags = (value) => value.replaceAll(/<[^>]*>/g, "").trim();

// src/lib/fp.ts
function pipe(value, ...fns) {
  return fns.reduce((result, fn) => fn(result), value);
}
var map = (transform) => (values) => values.map(transform);
var mapIndexed = (transform) => (values) => values.map(transform);
var join = (separator) => (values) => values.join(separator);
var appendWhen = (condition, suffix) => (value) => condition ? `${value}${suffix}` : value;

// src/source/tokenizer.ts
var syntaxToken = (kind, value) => ({ kind, value });
var plainTokens = (value) => value.length === 0 ? [] : [syntaxToken("plain", value)];
var tokenizeByPattern = (pattern, tokenizeMatch) => (source) => {
  const initialState = { cursor: 0, tokens: [] };
  const finalState = Array.from(source.matchAll(pattern)).reduce(
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
  return [...finalState.tokens, ...plainTokens(source.slice(finalState.cursor))];
};

// src/source/highlight.ts
var attributePattern = /([A-Za-z_:][-A-Za-z0-9_:.]*)(=)("[^"]*"|'[^']*')/g;
var tagPattern = /<[^>]*>/g;
var tagFragmentPattern = /^(<\/?|<!)([^\s/>]+)(.*?)(\/?>)$/;
var commentPattern = /<!--[\s\S]*?-->|<!DOCTYPE\b[^>]*>/gi;
var tokenizeAttributes = tokenizeByPattern(
  attributePattern,
  ([, name, equals, quotedValue]) => [
    syntaxToken("attr", name),
    syntaxToken("plain", equals),
    syntaxToken("value", quotedValue)
  ]
);
var tokenizeTagFragment = (source) => {
  const match = source.match(tagFragmentPattern);
  return match ? [
    syntaxToken("bracket", match[1]),
    syntaxToken("tag", match[2]),
    ...tokenizeAttributes(match[3]),
    syntaxToken("bracket", match[4])
  ] : plainTokens(source);
};
var tokenizeTags = tokenizeByPattern(tagPattern, ([tag]) => tokenizeTagFragment(tag));
var tokenizeComments = tokenizeByPattern(commentPattern, ([comment]) => [
  syntaxToken("comment", comment)
]);
var tokenizeHtml = (source) => tokenizeComments(source).flatMap(
  (token) => token.kind === "plain" ? tokenizeTags(token.value) : [token]
);
var renderSyntaxToken = ({ kind, value }) => kind === "plain" ? escapeHtml(value) : `<span class="syntax syntax-${kind}">${escapeHtml(value)}</span>`;
var highlightHtml = (source) => pipe(source, tokenizeHtml, map(renderSyntaxToken), join(""));

// src/source/links.ts
var linkAccents = ["#4f8cff", "#12a8a8", "#f05d5e", "#d079ff", "#f2b84b"];
var anchorPattern = /<a\s+[^>]*href=(["'])(.*?)\1[^>]*>(.*?)<\/a>/g;
var commentPattern2 = /<!--[\s\S]*?-->/g;
var accentAt = (index) => linkAccents[index % linkAccents.length];
var sourceLinkFromMatch = (lineIndex, anchorIndex) => (match) => ({
  href: match[2],
  label: stripTags(match[3]),
  accent: accentAt(lineIndex + anchorIndex)
});
var sourceAnchorFromMatch = (lineIndex) => (match, anchorIndex) => {
  const start = match.index ?? 0;
  return {
    start,
    end: start + match[0].length,
    source: match[0],
    link: sourceLinkFromMatch(lineIndex, anchorIndex)(match)
  };
};
var commentRangesFromLine = (source) => Array.from(source.matchAll(commentPattern2)).map((match) => {
  const start = match.index ?? 0;
  return {
    start,
    end: start + match[0].length
  };
});
var startsInsideRange = (ranges) => (match) => {
  const start = match.index ?? 0;
  return ranges.some((range) => start >= range.start && start < range.end);
};
var anchorsFromLine = (source, lineIndex) => {
  const commentRanges = commentRangesFromLine(source);
  return Array.from(source.matchAll(anchorPattern)).filter((match) => !startsInsideRange(commentRanges)(match)).map(sourceAnchorFromMatch(lineIndex));
};

// src/source/source-line.ts
var hrefDisplayPattern = /\bhref=(["'])(.*?)\1/;
var plainSegment = (source) => ({
  html: highlightHtml(source)
});
var anchorSegment = ({ source, link }) => ({
  html: highlightHtml(displayAnchorHrefAsPlaceholder(source)),
  link
});
var displayAnchorHrefAsPlaceholder = (source) => source.replace(hrefDisplayPattern, (_match, quote) => `href=${quote}...${quote}`);
var segmentWhenPresent = (source) => source.length === 0 ? [] : [plainSegment(source)];
var segmentsFromAnchors = (line, anchors) => {
  const [anchor, ...rest] = anchors;
  return anchor ? [
    ...segmentWhenPresent(line.slice(0, anchor.start)),
    anchorSegment(anchor),
    ...segmentsFromAnchors(line.slice(anchor.end), shiftAnchors(-anchor.end, rest))
  ] : segmentWhenPresent(line);
};
var shiftAnchors = (offset, anchors) => anchors.map((anchor) => ({
  ...anchor,
  start: anchor.start + offset,
  end: anchor.end + offset
}));
var sourceLineFromText = (line, index) => ({
  segments: segmentsFromAnchors(line, anchorsFromLine(line, index))
});

// src/source/lines.ts
var visibleLines = (source) => (source.endsWith("\n") ? source.slice(0, -1) : source).split("\n");

// src/view/attributes.ts
var externalLinkSafetyAttributes = (href) => href.startsWith("mailto:") ? "" : 'target="_blank" rel="noopener noreferrer"';
var linkAttributes = ({ href, label, accent }) => [
  `href="${escapeHtml(href)}"`,
  `aria-label="${escapeHtml(`Open ${label}`)}"`,
  externalLinkSafetyAttributes(href),
  `style="--line-accent: ${escapeHtml(accent)}"`
].filter(Boolean).join(" ");

// src/view/source-code.ts
var renderLinkedSegment = (segment) => `<a class="code-link" ${linkAttributes(segment.link)}>${segment.html}</a>`;
var renderPlainSegment = ({ html }) => html;
var renderSegment = (segment) => segment.link ? renderLinkedSegment({ ...segment, link: segment.link }) : renderPlainSegment(segment);
var renderLine = ({ segments }, index) => `<span class="code-line" style="--line-index: ${index}">${segments.map(renderSegment).join("")}</span>`;
var renderSource = (source) => pipe(
  source,
  visibleLines,
  mapIndexed(sourceLineFromText),
  mapIndexed(renderLine),
  join("\n"),
  appendWhen(source.endsWith("\n"), "\n")
);

// src/view.ts
var renderHomepage = ({ filename, source }) => `
  <main class="source-page" aria-label="${escapeHtml(filename)} source code">
    <pre class="source-code"><code>${renderSource(source)}</code></pre>
  </main>
`;

// src/main.ts
var appId = "app";
var main = async () => {
  const source = await fetchCurrentPageSource();
  const app = renderHomepage({
    filename: "index.html",
    source
  });
  mountApp(appId, app);
};
void main().catch((error) => {
  console.error(error);
  revealPage();
});
