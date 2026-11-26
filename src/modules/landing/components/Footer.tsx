import { Link } from 'react-router';
import { Logo } from '@/shared/components/common/Logo';
import { NAV_LINKS } from './content';

const ACCOUNT_LINKS = [
  { label: 'Sign in', to: '/login' },
  { label: 'Create account', to: '/register' },
  { label: 'Forgot password', to: '/forgot-password' },
];

export function Footer() {
  return (
    <footer className="border-t border-line bg-surface-sunken">
      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
        <div className="grid gap-10 md:grid-cols-12">
          <div className="md:col-span-6">
            <Logo />
            <p className="mt-3 max-w-sm text-sm leading-relaxed text-ink-muted">
              FPT Academic Advising &amp; Planning System — connecting curriculum progress, AI study
              roadmaps, and academic advising in one platform.
            </p>
          </div>

          <div className="md:col-span-3">
            <p className="text-xs font-semibold uppercase tracking-wider text-ink-primary">Platform</p>
            <nav className="mt-3 flex flex-col gap-2.5" aria-label="Footer platform links">
              {NAV_LINKS.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  className="text-sm text-ink-muted transition-colors hover:text-brand"
                >
                  {link.label}
                </a>
              ))}
            </nav>
          </div>

          <div className="md:col-span-3">
            <p className="text-xs font-semibold uppercase tracking-wider text-ink-primary">Account</p>
            <nav className="mt-3 flex flex-col gap-2.5" aria-label="Footer account links">
              {ACCOUNT_LINKS.map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  className="text-sm text-ink-muted transition-colors hover:text-brand"
                >
                  {link.label}
                </Link>
              ))}
            </nav>
          </div>
        </div>

        <div className="mt-10 flex flex-col items-center justify-between gap-2 border-t border-line pt-6 text-xs text-ink-muted sm:flex-row">
          <p>&copy; {new Date().getFullYear()} FAAPS. All rights reserved.</p>
          <p>FPT University · Academic Advising &amp; Planning System</p>
        </div>
      </div>
    </footer>
  );
}
