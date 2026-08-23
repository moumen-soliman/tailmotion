import { Check, Github, Sparkles } from 'lucide-react';
import { Button, CommandPill, CONTROL_TRANSITION, FOCUS_RING, cx, useCopy } from '../lib/ui';
import { AI_INSTALL_PROMPT } from '../lib/prompts';

/* Absolute hrefs so the same nav works from the landing page and /changelog/.
   `Animations` stays reachable at every width; the rest appears once there is
   room for it rather than being pushed out of the row. */
const LINKS = [
  { id: 'animations', href: '/#explorer', label: 'Animations', always: true },
  { id: 'example', href: '/example/', label: 'Example' },
  { id: 'install', href: '/#install', label: 'Installation' },
  { id: 'changelog', href: '/changelog/', label: 'Changelog' },
];

const GITHUB = 'https://github.com/moumen-soliman/tailmotion';

export function Nav({ current }) {
  const { copied, copy } = useCopy();

  return (
    <header className="sticky top-0 z-50 border-b border-line bg-page/80 backdrop-blur-md">
      <nav
        aria-label="Main"
        className="mx-auto flex h-14 w-full max-w-shell items-center gap-3 px-5 sm:px-6 lg:px-8"
      >
        <a href="/" className="flex shrink-0 items-center gap-2.5" aria-label="TailMotion, home">
          <span className="logo">
            <img src="/logo.svg" alt="" />
          </span>
          <span className="sr-only">TailMotion</span>
        </a>

        <ul className="ms-1 flex items-center gap-1 sm:ms-2">
          {LINKS.map((link) => {
            const active = current === link.id;
            return (
              <li key={link.href} className={link.always ? undefined : 'hidden sm:block'}>
                <a
                  href={link.href}
                  aria-current={active ? 'page' : undefined}
                  className={cx(
                    'rounded-md px-2 py-1.5 text-label sm:px-2.5',
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

        <div className="ms-auto flex items-center gap-2">
          <CommandPill command="npm i tailmotion" className="hidden sm:inline-flex" />
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
