import { Github } from 'lucide-react';
import { CONTROL_TRANSITION, cx } from '../lib/ui';

const GITHUB = 'https://github.com/moumen-soliman/tailmotion';

const LINK = cx('hover:text-ink', CONTROL_TRANSITION);

export function SiteFooter() {
  return (
    <footer className="border-t border-line">
      <div className="mx-auto flex w-full max-w-shell flex-wrap items-center gap-x-6 gap-y-2 px-5 py-8 text-label text-ink-muted sm:px-6 lg:px-8">
        <span>MIT License</span>
        <span className="font-mono text-micro text-ink-faint">tailmotion</span>
        <div className="ms-auto flex items-center gap-5">
          <a href="/changelog/" className={LINK}>
            Changelog
          </a>
          <a href={GITHUB} target="_blank" rel="noreferrer" className={cx('inline-flex items-center gap-1.5', LINK)}>
            <Github className="h-3.5 w-3.5" aria-hidden />
            GitHub
          </a>
          <a href="https://npmjs.com/package/tailmotion" target="_blank" rel="noreferrer" className={LINK}>
            npm
          </a>
        </div>
      </div>
    </footer>
  );
}
