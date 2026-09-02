/* --------------------------------------------------------------------------
   A small parser for the subset of Markdown CHANGELOG.md actually uses:
   `## version`, `### group`, paragraphs, `- ` bullets with continuation
   lines, ``` fenced blocks, `**bold**` and `` `code` ``.

   The page reads the real file, so the site can never drift from the
   changelog that ships in the repository. A general Markdown library would
   be a dependency for five constructs.

   Blocks come back tagged -- `{ type: 'text' }` for prose, `{ type: 'code' }`
   for a fence. A fence has to survive as its own block: folded into a
   paragraph, its lines join with spaces and the surrounding backticks read as
   one inline code span, which the page renders `whitespace-nowrap`. That is a
   single unbreakable line as wide as the snippet, and it pushes the page out
   past the viewport.
   -------------------------------------------------------------------------- */

/** Splits a line into text / bold / code spans. */
export function parseInline(text) {
  const spans = [];
  const pattern = /(\*\*[^*]+\*\*|`[^`]+`)/g;
  let cursor = 0;

  for (const match of text.matchAll(pattern)) {
    if (match.index > cursor) {
      spans.push({ type: 'text', value: text.slice(cursor, match.index) });
    }
    const token = match[0];
    if (token.startsWith('**')) {
      spans.push({ type: 'strong', value: token.slice(2, -2) });
    } else {
      spans.push({ type: 'code', value: token.slice(1, -1) });
    }
    cursor = match.index + token.length;
  }

  if (cursor < text.length) spans.push({ type: 'text', value: text.slice(cursor) });
  return spans;
}

/** Drops up to `indent` columns of leading whitespace, never any content. */
function stripIndent(line, indent) {
  let column = 0;
  while (column < indent && (line[column] === ' ' || line[column] === '\t')) column += 1;
  return line.slice(column);
}

/**
 * @returns {{ intro: Block[], releases: Array<{
 *   version: string, status: string|null, summary: Block[],
 *   groups: Array<{ title: string, items: Block[] }>
 * }>}}
 * where Block is
 *   { type: 'text', value: string } | { type: 'code', lang: string|null, value: string }
 */
export function parseChangelog(source) {
  const releases = [];
  const intro = [];
  let release = null;
  let group = null;
  let paragraph = [];
  let fence = null;

  const pushBlock = (block) => {
    if (group) group.items.push(block);
    else if (release) release.summary.push(block);
    else intro.push(block);
  };

  const flushParagraph = () => {
    if (!paragraph.length) return;
    pushBlock({ type: 'text', value: paragraph.join(' ') });
    paragraph = [];
  };

  const flushFence = () => {
    if (!fence) return;
    // The indentation belongs to the bullet the fence sits under, not to the
    // snippet, so the opening fence's own indent comes off every line.
    const value = fence.lines
      .map((line) => stripIndent(line, fence.indent))
      .join('\n')
      .replace(/\s+$/, '');
    if (value) pushBlock({ type: 'code', lang: fence.lang, value });
    fence = null;
  };

  for (const raw of source.split('\n')) {
    const line = raw.trimEnd();

    if (line.trimStart().startsWith('```')) {
      if (fence) {
        flushFence();
      } else {
        flushParagraph();
        const info = line.trimStart();
        fence = {
          lang: info.slice(3).trim() || null,
          indent: line.length - info.length,
          lines: [],
        };
      }
      continue;
    }

    if (fence) {
      fence.lines.push(line);
      continue;
    }

    if (line.startsWith('## ')) {
      flushParagraph();
      const [version, status] = line.slice(3).split('·').map((part) => part.trim());
      release = { version, status: status || null, summary: [], groups: [] };
      group = null;
      releases.push(release);
      continue;
    }

    if (line.startsWith('### ')) {
      flushParagraph();
      group = { title: line.slice(4).trim(), items: [] };
      release?.groups.push(group);
      continue;
    }

    if (line.startsWith('# ')) {
      flushParagraph();
      continue;
    }

    if (!line.trim()) {
      flushParagraph();
      continue;
    }

    if (line.startsWith('- ')) {
      flushParagraph();
      paragraph = [line.slice(2).trim()];
      continue;
    }

    // A continuation line belongs to whatever is open.
    paragraph.push(line.trim());
  }

  // An unclosed fence still ends at the end of the file.
  flushFence();
  flushParagraph();
  return { intro, releases };
}
