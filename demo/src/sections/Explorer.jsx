import { useDeferredValue, useEffect, useMemo, useState } from 'react';
import { RotateCcw, Search, X } from 'lucide-react';
import { CATEGORIES, GROUPS, REPLAYABLE, catalog } from '../animations';
import { AnimationPreview } from '../lib/previews';
import { classForTrigger, triggersFor } from '../lib/variants';
import {
  Badge,
  Button,
  Card,
  Chip,
  ChipGroup,
  CONTROL_TRANSITION,
  CopyButton,
  Section,
  SectionHeading,
  cx,
} from '../lib/ui';

/* --------------------------------------------------------------------------
   The explorer: filter, preview, copy.

   Panel heights are fluid rather than a fixed 500px, so the three panels stack
   cleanly on a phone and grow with the viewport on a desktop.
   -------------------------------------------------------------------------- */

const REQUIRES_LABEL = {
  css: 'CSS only',
  markup: 'Markup',
  js: 'JS',
};

const REQUIRES_TONE = {
  css: 'neutral',
  markup: 'warn',
  js: 'warn',
};

function matches(entry, query, category) {
  if (category === 'popular' && !entry.popular) return false;
  if (category !== 'all' && category !== 'popular' && entry.category !== category) return false;
  if (!query) return true;
  const haystack = `tm-${entry.name} ${entry.category} ${entry.group} ${entry.description || ''}`;
  return haystack.toLowerCase().includes(query.toLowerCase());
}

function EntryRow({ entry, selected, onSelect }) {
  return (
    <li>
      <button
        type="button"
        onClick={() => onSelect(entry.name)}
        aria-current={selected ? 'true' : undefined}
        className={cx(
          'flex w-full items-center gap-2 rounded-md border px-2.5 py-2 text-start',
          'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2',
          'focus-visible:outline-accent',
          CONTROL_TRANSITION,
          selected
            ? 'border-ink-faint bg-card-hover'
            : 'border-transparent hover:border-line hover:bg-card-hover'
        )}
      >
        <span
          className={cx(
            'h-1.5 w-1.5 shrink-0 rounded-full transition-colors duration-150 ease-out',
            selected ? 'bg-ink-strong' : 'bg-line-strong'
          )}
          aria-hidden
        />
        <span dir="ltr" className={cx('min-w-0 flex-1 truncate font-mono text-micro', selected ? 'text-ink-strong' : 'text-ink-muted')}>
          tm-{entry.name}
        </span>
        {entry.alias ? <Badge>alias</Badge> : null}
        {entry.requires !== 'css' ? (
          <Badge tone={REQUIRES_TONE[entry.requires]}>{REQUIRES_LABEL[entry.requires]}</Badge>
        ) : null}
      </button>
    </li>
  );
}

export function Explorer({ variants }) {
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('popular');
  const [selected, setSelected] = useState('pop');
  const [trigger, setTrigger] = useState('load');
  const [replayKey, setReplayKey] = useState(0);

  const deferredQuery = useDeferredValue(query);

  const visible = useMemo(
    () => catalog.filter((entry) => matches(entry, deferredQuery, category)),
    [deferredQuery, category]
  );

  const grouped = useMemo(
    () =>
      GROUPS.map((group) => ({
        ...group,
        items: visible.filter((entry) => entry.group === group.id),
      })).filter((group) => group.items.length > 0),
    [visible]
  );

  // Keep the selection inside the current filter, so the preview always
  // matches something the list is showing.
  useEffect(() => {
    if (visible.length && !visible.some((entry) => entry.name === selected)) {
      setSelected(visible[0].name);
      setReplayKey((k) => k + 1);
    }
  }, [visible, selected]);

  const entry = useMemo(() => catalog.find((a) => a.name === selected), [selected]);
  const triggers = useMemo(
    () => (entry && REPLAYABLE.has(entry.name) ? triggersFor(entry.name, variants) : [{ id: 'load', label: 'Load' }]),
    [entry, variants]
  );
  const activeTrigger = triggers.some((t) => t.id === trigger) ? trigger : 'load';

  if (!entry) return null;

  const className = REPLAYABLE.has(entry.name)
    ? classForTrigger(entry.name, activeTrigger)
    : `tm-${entry.name}`;
  const markup = entry.markup || `<div class="${className}">\n  Content\n</div>`;
  const canReplay = REPLAYABLE.has(entry.name) && activeTrigger === 'load';

  return (
    <Section id="explorer">
      <SectionHeading eyebrow="Explorer" title="Every class, one at a time">
        {catalog.length} classes, grouped by how they work. Keyframes play and replay; transitions
        respond to a state; recipes need a little markup.
      </SectionHeading>

      <div className="mt-8 grid grid-cols-1 items-start gap-4 lg:mt-10 lg:grid-cols-[minmax(0,17rem)_minmax(0,1fr)] lg:gap-5">
        {/* -------------------------------------------------- panel 1: browse */}
        <Card className="flex min-h-0 min-w-0 flex-col">
          <div className="border-b border-line p-3">
            <div className="relative">
              <Search
                className="pointer-events-none absolute inset-y-0 start-2.5 my-auto h-3.5 w-3.5 text-ink-faint"
                aria-hidden
              />
              <input
                type="search"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search classes"
                aria-label="Search animation classes"
                className={cx(
                  'h-9 w-full rounded-md border border-line bg-page ps-8 pe-8',
                  'text-label text-ink placeholder:text-ink-faint',
                  'focus:border-line-strong focus:outline-none focus-visible:outline focus-visible:outline-2',
                  'focus-visible:outline-offset-2 focus-visible:outline-accent',
                  CONTROL_TRANSITION
                )}
              />
              {query ? (
                <button
                  type="button"
                  onClick={() => setQuery('')}
                  aria-label="Clear search"
                  className="absolute inset-y-0 end-2 my-auto grid h-5 w-5 place-items-center rounded text-ink-faint transition-colors duration-150 ease-out hover:text-ink"
                >
                  <X className="h-3.5 w-3.5" aria-hidden />
                </button>
              ) : null}
            </div>
          </div>

          <div className="border-b border-line p-3">
            <div className="rail -mx-1 flex gap-2 overflow-x-auto px-1 pb-1 lg:flex-wrap lg:overflow-visible">
              <Chip selected={category === 'all'} onClick={() => setCategory('all')}>
                All
              </Chip>
              {CATEGORIES.map((item) => (
                <Chip key={item.id} selected={category === item.id} onClick={() => setCategory(item.id)}>
                  {item.label}
                </Chip>
              ))}
            </div>
          </div>

          <div className="max-h-[22rem] min-h-0 flex-1 overflow-y-auto p-3 lg:max-h-[34rem]">
            {grouped.length === 0 ? (
              <p className="px-1 py-6 text-center text-label text-ink-muted">
                Nothing matches “{query}”.
              </p>
            ) : (
              <div className="space-y-4">
                {grouped.map((group) => (
                  <div key={group.id}>
                    <div className="mb-1.5 px-1">
                      <p className="font-mono text-micro uppercase tracking-wider text-ink-faint">
                        {group.label} · {group.items.length}
                      </p>
                      <p className="mt-0.5 text-micro leading-snug text-ink-faint">{group.hint}</p>
                    </div>
                    <ul className="space-y-0.5">
                      {group.items.map((item) => (
                        <EntryRow
                          key={item.name}
                          entry={item}
                          selected={item.name === selected}
                          onSelect={(name) => {
                            setSelected(name);
                            setReplayKey((k) => k + 1);
                          }}
                        />
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            )}
          </div>
        </Card>

        {/* ------------------------------------- panels 2+3: preview and code */}
        <div className="grid min-w-0 grid-cols-1 items-start gap-4 xl:grid-cols-2 xl:gap-5">
          <Card className="flex min-w-0 flex-col">
            <div className="flex flex-wrap items-center gap-2 border-b border-line px-4 py-3">
              <div className="min-w-0">
                <p dir="ltr" className="truncate font-mono text-label text-ink">tm-{entry.name}</p>
                <p className="mt-0.5 text-micro text-ink-muted">{entry.description}</p>
              </div>
              <Button
                size="sm"
                className="ms-auto"
                onClick={() => setReplayKey((k) => k + 1)}
                disabled={!canReplay}
                title={
                  canReplay
                    ? 'Replay the animation'
                    : 'This class runs from a state change, so there is nothing to replay'
                }
              >
                <RotateCcw className="h-3.5 w-3.5" aria-hidden />
                Replay
              </Button>
            </div>

            <div className="grid min-h-[14rem] place-items-center bg-page p-6 sm:min-h-[17rem]">
              <AnimationPreview entry={entry} appliedClass={className} replayKey={replayKey} />
            </div>

            {triggers.length > 1 ? (
              <div className="border-t border-line p-3">
                <ChipGroup label="Trigger">
                  {triggers.map((option) => (
                    <Chip
                      key={option.id}
                      selected={activeTrigger === option.id}
                      onClick={() => {
                        setTrigger(option.id);
                        setReplayKey((k) => k + 1);
                      }}
                    >
                      {option.label}
                    </Chip>
                  ))}
                </ChipGroup>
              </div>
            ) : null}
          </Card>

          <Card className="flex min-w-0 flex-col">
            <div className="flex items-center gap-2 border-b border-line px-4 py-3">
              <p className="text-label font-medium text-ink">Copy</p>
              <span className="ms-auto flex gap-2">
                <CopyButton value={className} label="Class" copiedLabel="Copied" />
                <CopyButton value={markup} label="Markup" copiedLabel="Copied" />
              </span>
            </div>

            <div className="min-w-0 space-y-3 p-4">
              <div>
                <p className="mb-1.5 font-mono text-micro uppercase tracking-wider text-ink-faint">Class</p>
                <pre dir="ltr" className="overflow-x-auto rounded-md border border-line bg-page p-3 text-micro text-ink">
                  <code className="font-mono">{className}</code>
                </pre>
              </div>
              <div>
                <p className="mb-1.5 font-mono text-micro uppercase tracking-wider text-ink-faint">Markup</p>
                <pre dir="ltr" className="overflow-x-auto rounded-md border border-line bg-page p-3 text-micro leading-relaxed text-ink">
                  <code className="font-mono">{markup}</code>
                </pre>
              </div>
              {entry.requires !== 'css' ? (
                <p className="text-micro text-ink-muted">
                  {entry.requires === 'js'
                    ? 'This effect needs the JavaScript helper shown above. The CSS alone will not swap the text.'
                    : 'This class needs the child structure shown above.'}
                </p>
              ) : null}
            </div>
          </Card>
        </div>
      </div>
    </Section>
  );
}
