import { Check, ChevronDown, Github, Sparkles } from 'lucide-react';
import { Button, CommandPill, CONTROL_TRANSITION, FOCUS_RING, cx, useCopy } from '../lib/ui';
import { AI_INSTALL_PROMPT } from '../lib/prompts';

/* Absolute hrefs keep this nav portable across every demo entry point.
   Product demos live in one native popover; documentation destinations remain
   direct links so they never bounce through the landing page first. */
const EXPLORE_LINKS = [
  {
    id: 'animations',
    href: '/#explorer',
    label: 'Animations',
    detail: 'Browse every motion utility',
  },
  {
    id: 'capabilities',
    href: '/capabilities/',
    label: 'Capabilities',
    detail: 'Explore product-ready motion',
  },
  {
    id: 'example',
    href: '/example/',
    label: 'Example',
    detail: 'See TailMotion in an interface',
  },
];

const LINKS = [
  { id: 'docs', href: 'https://docs.tailmotion.moumen.dev/docs', label: 'Docs' },
  {
    id: 'install',
    href: 'https://docs.tailmotion.moumen.dev/docs/install',
    label: 'Installation',
  },
  { id: 'changelog', href: '/changelog/', label: 'Changelog' },
];

const GITHUB = 'https://github.com/moumen-soliman/tailmotion';

export function Nav({ current }) {
  const { copied, copy } = useCopy();

  return (
    <header className="sticky top-0 z-50 border-b border-line bg-page/80 backdrop-blur-md">
      <nav
        aria-label="Main"
        className="flex h-14 w-full items-center px-5 sm:px-6 lg:px-8"
      >
        <a href="/" className="flex shrink-0 items-center gap-2.5" aria-label="TailMotion, home">
          <span className="logo">
            <img src="/logo.svg" alt="" />
          </span>
          <span className="sr-only">TailMotion</span>
        </a>

        <div className="ms-2 flex min-w-0 items-center gap-1">
          {/* sm and up: Explore stays its own popover, and LINKS below renders
              inline. Below sm there isn't room for a second trigger without
              overflowing the header (measured: a same-sized "Docs" trigger
              pushes the AI-prompt/GitHub icons off-screen up to ~390px wide),
              so the two groups fold into one "Menu" popover instead of gaining
              a second trigger. */}
          <div className="relative hidden sm:block">
            <Button
              variant="ghost"
              size="sm"
              popovertarget="nav-explore-menu"
              aria-haspopup="true"
              aria-controls="nav-explore-menu"
              className={cx(
                'gap-1.5 px-2.5',
                EXPLORE_LINKS.some((link) => link.id === current)
                  ? 'text-ink-strong'
                  : 'text-ink-muted'
              )}
              style={{ anchorName: '--nav-explore-anchor' }}
            >
              Explore
              <ChevronDown className="h-3.5 w-3.5" strokeWidth={1.75} aria-hidden />
            </Button>

            <div
              id="nav-explore-menu"
              popover=""
              aria-label="Explore TailMotion"
              className="tm-native-popover w-64 rounded-lg border border-line bg-card p-1.5 shadow-2xl"
              style={{
                '--tm-origin': 'top center',
                positionAnchor: '--nav-explore-anchor',
                positionArea: 'bottom center',
                margin: 0,
                marginTop: '8px',
              }}
            >
              <ul>
                {EXPLORE_LINKS.map((link) => {
                  const active = current === link.id;
                  return (
                    <li key={link.href}>
                      <a
                        href={link.href}
                        aria-current={active ? 'page' : undefined}
                        className={cx(
                          'block rounded-md px-3 py-2.5',
                          FOCUS_RING,
                          CONTROL_TRANSITION,
                          active ? 'bg-card-hover text-ink-strong' : 'hover:bg-card-hover'
                        )}
                      >
                        <span className="block text-label font-medium text-ink-strong">{link.label}</span>
                        <span className="mt-0.5 block text-micro text-ink-muted">{link.detail}</span>
                      </a>
                    </li>
                  );
                })}
              </ul>
            </div>
          </div>

          {/* Below sm: one popover carries both Explore's links and Docs'
              links, so Example and Docs stay reachable without a second
              trigger competing for width. */}
          <div className="relative sm:hidden">
            <Button
              variant="ghost"
              size="sm"
              popovertarget="nav-mobile-menu"
              aria-haspopup="true"
              aria-controls="nav-mobile-menu"
              className={cx(
                'gap-1.5 px-2',
                [...EXPLORE_LINKS, ...LINKS].some((link) => link.id === current)
                  ? 'text-ink-strong'
                  : 'text-ink-muted'
              )}
              style={{ anchorName: '--nav-mobile-anchor' }}
            >
              Menu
              <ChevronDown className="h-3.5 w-3.5" strokeWidth={1.75} aria-hidden />
            </Button>

            <div
              id="nav-mobile-menu"
              popover=""
              aria-label="TailMotion menu"
              className="tm-native-popover w-64 rounded-lg border border-line bg-card p-1.5 shadow-2xl"
              style={{
                '--tm-origin': 'top center',
                positionAnchor: '--nav-mobile-anchor',
                positionArea: 'bottom center',
                margin: 0,
                marginTop: '8px',
              }}
            >
              <ul>
                {EXPLORE_LINKS.map((link) => {
                  const active = current === link.id;
                  return (
                    <li key={link.href}>
                      <a
                        href={link.href}
                        aria-current={active ? 'page' : undefined}
                        className={cx(
                          'block rounded-md px-3 py-2.5',
                          FOCUS_RING,
                          CONTROL_TRANSITION,
                          active ? 'bg-card-hover text-ink-strong' : 'hover:bg-card-hover'
                        )}
                      >
                        <span className="block text-label font-medium text-ink-strong">{link.label}</span>
                        <span className="mt-0.5 block text-micro text-ink-muted">{link.detail}</span>
                      </a>
                    </li>
                  );
                })}
              </ul>
              <div className="my-1.5 border-t border-line" role="separator" />
              <ul>
                {LINKS.map((link) => {
                  const active = current === link.id;
                  return (
                    <li key={link.href}>
                      <a
                        href={link.href}
                        aria-current={active ? 'page' : undefined}
                        className={cx(
                          'block rounded-md px-3 py-2.5 text-label font-medium',
                          FOCUS_RING,
                          CONTROL_TRANSITION,
                          active ? 'bg-card-hover text-ink-strong' : 'text-ink-strong hover:bg-card-hover'
                        )}
                      >
                        {link.label}
                      </a>
                    </li>
                  );
                })}
              </ul>
            </div>
          </div>

          <ul className="hidden items-center gap-1 sm:flex">
            {LINKS.map((link) => {
              const active = current === link.id;
              return (
                <li key={link.href}>
                  <a
                    href={link.href}
                    aria-current={active ? 'page' : undefined}
                    className={cx(
                      'inline-flex h-8 items-center rounded-md px-2.5 text-label font-medium',
                      active ? 'text-ink-strong' : 'text-ink-muted hover:bg-card-hover hover:text-ink',
                      FOCUS_RING,
                      CONTROL_TRANSITION
                    )}
                  >
                    {link.label}
                  </a>
                </li>
              );
            })}
          </ul>
        </div>

        <div className="ms-auto flex items-center gap-2">
          <CommandPill command="npm i tailmotion" className="hidden lg:inline-flex" />
          <Button
            variant="ghost"
            size="sm"
            onClick={() => copy(AI_INSTALL_PROMPT)}
            aria-label="Copy the TailMotion AI installation prompt"
            title="Copy AI install prompt"
          >
            {copied ? (
              <Check className="h-3.5 w-3.5 shrink-0 text-accent" aria-hidden />
            ) : (
              <Sparkles className="h-3.5 w-3.5 shrink-0" aria-hidden />
            )}
            <span className="hidden whitespace-nowrap xl:inline">
              {copied ? 'Prompt copied' : 'AI install prompt'}
            </span>
            <span className="sr-only" role="status">
              {copied ? 'Prompt copied' : ''}
            </span>
          </Button>
          <a
            href={GITHUB}
            target="_blank"
            rel="noreferrer"
            aria-label="TailMotion on GitHub"
            className={cx(
              'tm-press grid h-8 w-8 place-items-center rounded-md text-ink-muted',
              'hover:bg-card-hover hover:text-ink',
              FOCUS_RING,
              CONTROL_TRANSITION
            )}
          >
            <Github className="h-4 w-4" aria-hidden />
          </a>
        </div>
      </nav>
    </header>
  );
}
