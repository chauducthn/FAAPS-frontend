import { useState } from 'react';
import { ArrowRight, List as Menu, X } from '@phosphor-icons/react';
import { Logo } from '@/shared/components/common/Logo';
import { CTAButton } from '@/shared/components/common/CTAButton';
import { ThemeToggle } from '@/shared/components/common/ThemeToggle';
import { useAuth } from '@/modules/auth/stores/useAuth';
import { getPortalLabel, getPortalPath, NAV_LINKS } from './content';

export function Navbar() {
  const [open, setOpen] = useState(false);
  const user = useAuth((s) => s.user);
  const isAuthenticated = useAuth((s) => s.isAuthenticated);
  const close = () => setOpen(false);

  const portalPath = getPortalPath(user?.role);
  const portalLabel = getPortalLabel(user?.role);

  return (
    <header className="sticky top-0 z-40 border-b border-line bg-white/95 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
        <Logo />

        <nav className="hidden items-center gap-8 md:flex" aria-label="Main navigation">
          {NAV_LINKS.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="text-sm font-medium text-ink-muted transition-colors hover:text-brand"
            >
              {link.label}
            </a>
          ))}
        </nav>

        <div className="hidden items-center gap-3 md:flex">
          <ThemeToggle />
          {isAuthenticated && user ? (
            <CTAButton to={portalPath}>
              {portalLabel}
              <ArrowRight className="size-4" aria-hidden />
            </CTAButton>
          ) : (
            <>
              <CTAButton variant="outline">Sign in</CTAButton>
              <CTAButton to="/register">Get Started</CTAButton>
            </>
          )}
        </div>

        <div className="flex items-center gap-2 md:hidden">
          <ThemeToggle />
          <button
            type="button"
            className="rounded-md p-2 text-ink-secondary hover:bg-surface-hover"
            aria-label={open ? 'Close menu' : 'Open menu'}
            aria-expanded={open}
            onClick={() => setOpen((v) => !v)}
          >
            {open ? <X className="size-6" aria-hidden /> : <Menu className="size-6" aria-hidden />}
          </button>
        </div>
      </div>

      {open && (
        <div className="border-t border-line bg-white px-4 pb-4 md:hidden">
          <nav className="flex flex-col py-2" aria-label="Mobile navigation">
            {NAV_LINKS.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={close}
                className="rounded-md px-2 py-3 text-sm font-medium text-ink-secondary hover:bg-surface-hover hover:text-brand"
              >
                {link.label}
              </a>
            ))}
          </nav>
          <div className="flex flex-col gap-2 pt-2">
            {isAuthenticated && user ? (
              <CTAButton to={portalPath} onClick={close}>
                {portalLabel}
                <ArrowRight className="size-4" aria-hidden />
              </CTAButton>
            ) : (
              <>
                <CTAButton variant="outline" onClick={close}>
                  Sign in
                </CTAButton>
                <CTAButton to="/register" onClick={close}>
                  Get Started
                </CTAButton>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
