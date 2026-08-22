/* --------------------------------------------------------------------------
   A small parser for the subset of Markdown CHANGELOG.md actually uses:
   `## version`, `### group`, paragraphs, `- ` bullets with continuation
   lines, `**bold**` and `` `code` ``.

   The page reads the real file, so the site can never drift from the
   changelog that ships in the repository. A general Markdown library would
   be a dependency for four constructs.
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

/**
 * @returns {{ intro: string[], releases: Array<{
 *   version: string, status: string|null, summary: string[],
 *   groups: Array<{ title: string, items: string[] }>
 * }>}}
 */
export function parseChangelog(source) {
  const releases = [];
  const intro = [];
  let release = null;
  let group = null;
  let paragraph = [];

  const flushParagraph = () => {
    if (!paragraph.length) return;
    const text = paragraph.join(' ');
    if (group) group.items.push(text);
    else if (release) release.summary.push(text);
    else intro.push(text);
    paragraph = [];
  };

  for (const raw of source.split('\n')) {
    const line = raw.trimEnd();

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

  flushParagraph();
  return { intro, releases };
}
