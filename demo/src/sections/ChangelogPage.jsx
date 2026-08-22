import { ArrowLeft, ArrowRight } from 'lucide-react';
import changelogSource from '../../../CHANGELOG.md?raw';
import { parseChangelog, parseInline } from '../lib/changelog-parse';
import { Badge, Button, CONTROL_TRANSITION, Card, Shell, cx } from '../lib/ui';

/* --------------------------------------------------------------------------
   The changelog page.

   It reads the repository's CHANGELOG.md at build time, so the page cannot
   drift from the file that ships in the package.

   Each release is a two-column row: the version stays on the leading edge
   while its entries scroll past, which keeps "what release am I reading"
   answerable without scrolling back.
   -------------------------------------------------------------------------- */

const { releases } = parseChangelog(changelogSource);

/** Groups a reader scans for, in the order they care about. */
const GROUP_ORDER = ['Added', 'Changed', 'Fixed', 'Removed', 'Deprecated', 'Security'];

const groupRank = (title) => {
  const index = GROUP_ORDER.indexOf(title);
  return index === -1 ? GROUP_ORDER.length : index;
};

function Inline({ text }) {
  return (
    <>
      {parseInline(text).map((span, i) => {
        if (span.type === 'strong') {
          // eslint-disable-next-line react/no-array-index-key
          return (
            <strong key={i} className="font-medium text-ink">
              {span.value}
            </strong>
          );
        }
        if (span.type === 'code') {
          return (
            // eslint-disable-next-line react/no-array-index-key
            <code
              key={i}
              dir="ltr"
              /* No border: a paragraph can hold a dozen of these, and outlining
                 each one turns the sentence into a row of chips. nowrap keeps a
                 class name from splitting at its hyphens. */
              className="whitespace-nowrap rounded bg-card-hover px-1 py-0.5 font-mono text-[0.85em] text-ink"
            >
              {span.value}
            </code>
          );
        }
        // eslint-disable-next-line react/no-array-index-key
        return <span key={i}>{span.value}</span>;
      })}
    </>
  );
}

function Release({ release, isLatest }) {
  const groups = [...release.groups].sort((a, b) => groupRank(a.title) - groupRank(b.title));
  const total = groups.reduce((sum, group) => sum + group.items.length, 0);

  return (
    <article className="grid grid-cols-1 gap-6 border-t border-line pt-10 lg:grid-cols-[minmax(0,13rem)_minmax(0,1fr)] lg:gap-12">
      {/* Version rail. Sticks beside its own entries on wide screens. */}
      <header className="min-w-0 lg:sticky lg:top-24 lg:self-start">
        <div className="flex flex-wrap items-center gap-2">
          <h2 className="font-mono text-title font-medium tabular-nums text-ink-strong">
            {release.version}
          </h2>
          {release.status ? <Badge tone={isLatest ? 'accent' : 'neutral'}>{release.status}</Badge> : null}
        </div>
        <p className="mt-2 text-micro text-ink-faint">
          {total} {total === 1 ? 'entry' : 'entries'} across {groups.length}{' '}
          {groups.length === 1 ? 'group' : 'groups'}
        </p>
      </header>

      <div className="min-w-0 space-y-9">
        {release.summary.length ? (
          <div className="space-y-3">
            {release.summary.map((paragraph) => (
              <p key={paragraph} className="max-w-measure text-pretty text-body-lg text-ink-muted">
                <Inline text={paragraph} />
              </p>
            ))}
          </div>
        ) : null}

        {groups.map((group) => (
          <section key={group.title}>
            <div className="flex items-center gap-3">
              <h3 className="font-mono text-overline uppercase text-accent">{group.title}</h3>
              <span className="font-mono text-overline text-ink-faint">{group.items.length}</span>
              <span className="h-px flex-1 bg-line" aria-hidden />
            </div>
            <ul className="mt-4 space-y-3.5">
              {group.items.map((item) => (
                <li key={item} className="flex gap-3">
                  <span
                    className="mt-[0.6em] h-1 w-1 shrink-0 rounded-full bg-line-strong"
                    aria-hidden
                  />
                  <p className="max-w-measure text-pretty text-body text-ink-muted">
                    <Inline text={item} />
                  </p>
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>
    </article>
  );
}

export function ChangelogPage() {
  return (
    <main>
      <section className="pt-12 sm:pt-16 lg:pt-20">
        <Shell>
          <a
            href="/"
            className={cx(
              'inline-flex items-center gap-1.5 text-label text-ink-muted hover:text-ink',
              CONTROL_TRANSITION
            )}
          >
            <ArrowLeft className="h-3.5 w-3.5" aria-hidden />
            TailMotion
          </a>

          <div className="mt-6">
            <p className="font-mono text-overline uppercase text-accent">Changelog</p>
            <h1 className="mt-3 text-balance text-display font-semibold text-ink-strong sm:text-display-lg">
              Every release, and what it costs you
            </h1>
            <p className="mt-5 max-w-measure text-pretty text-body-lg text-ink-muted">
              Read from the repository&rsquo;s <code className="font-mono text-ink">CHANGELOG.md</code>, so this
              page and the package always say the same thing. Behaviour changes are called out
              alongside the additions, with the one-line override where one exists.
            </p>
          </div>

          <div className="mt-10 space-y-14 lg:mt-14 lg:space-y-20">
            {releases.map((release, index) => (
              <Release key={release.version} release={release} isLatest={index === 0} />
            ))}
          </div>

          <Card className="mt-14 flex flex-wrap items-center gap-x-6 gap-y-4 p-6 lg:mt-20">
            <div className="min-w-0 flex-1">
              <h2 className="text-heading font-medium text-ink-strong">Migrating from 0.5?</h2>
              <p className="mt-1.5 max-w-measure text-body text-ink-muted">
                The README carries the full migration notes, including the CSS one-liners that
                restore the pre-0.6 timing and travel distance.
              </p>
            </div>
            <div className="flex flex-wrap gap-2.5">
              <Button
                as="a"
                href="https://github.com/moumen-soliman/tailmotion#migrating-to-06"
                target="_blank"
                rel="noreferrer"
                variant="primary"
              >
                Migration notes
                <ArrowRight className="h-4 w-4" aria-hidden />
              </Button>
              <Button as="a" href="/#explorer" variant="secondary">
                Browse the classes
              </Button>
            </div>
          </Card>
        </Shell>
      </section>
    </main>
  );
}
