import { Link } from 'react-router';
import { Logo } from '@/shared/components/common/Logo';
import { NAV_LINKS } from './content';

const ACCOUNT_LINKS = [
  { label: 'Sign in', to: '/login' },
  { label: 'Create account', to: '/register' },
  { label: 'Forgot password', to: '/forgot-password' },
];

const LINK_CLASS = 'text-sm text-ink-muted transition-colors hover:text-ink-primary';
const HEADING_CLASS = 'text-[11px] font-semibold uppercase tracking-[0.18em] text-ink-subtle';

const BOTTOM_BAR_CLASS =
  'mt-16 flex flex-col items-start justify-between gap-2 border-t border-line pt-6 text-xs text-ink-subtle ' +
  'sm:flex-row sm:items-center';

export function Footer() {
  return (
    <footer className="border-t border-line bg-surface-page">
      <div className="mx-auto max-w-6xl px-4 pb-10 pt-16 sm:px-6">
        <div className="grid gap-12 md:grid-cols-12">
          <div className="md:col-span-6">
            <Logo />
            <p className="mt-5 max-w-sm text-sm leading-relaxed text-ink-muted">
              FPT Academic Advising &amp; Planning System — connecting curriculum progress, AI study roadmaps, and
              academic advising in one platform.
            </p>
          </div>

          <div className="md:col-span-3">
            <p className={HEADING_CLASS}>Platform</p>
            <nav className="mt-4 flex flex-col gap-3" aria-label="Footer platform links">
              {NAV_LINKS.map((link) => (
                <a key={link.href} href={link.href} className={LINK_CLASS}>
                  {link.label}
                </a>
              ))}
            </nav>
          </div>

          <div className="md:col-span-3">
            <p className={HEADING_CLASS}>Account</p>
            <nav className="mt-4 flex flex-col gap-3" aria-label="Footer account links">
              {ACCOUNT_LINKS.map((link) => (
                <Link key={link.to} to={link.to} viewTransition className={LINK_CLASS}>
                  {link.label}
                </Link>
              ))}
            </nav>
          </div>
        </div>

        <div className={BOTTOM_BAR_CLASS}>
          <p>&copy; {new Date().getFullYear()} FAAPS. All rights reserved.</p>
          <p>FPT University · Academic Advising &amp; Planning System</p>
        </div>
      </div>
    </footer>
  );
}
