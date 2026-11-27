import { useState } from 'react';
import { ArrowRight, List as Menu, X } from '@phosphor-icons/react';
import { Logo } from '@/shared/components/common/Logo';
import { CTAButton } from '@/shared/components/common/CTAButton';
import { ThemeToggle } from '@/shared/components/common/ThemeToggle';
import { useAuth } from '@/modules/auth/stores/useAuth';
import { cn } from '@/shared/lib/utils';
import { useScrolledPast } from '../hooks/useScrolledPast';
import { getPortalLabel, getPortalPath, NAV_LINKS } from './content';

const SCROLL_THRESHOLD_PX = 24;
const ON_HERO_TOGGLE = 'border-white/20 bg-white/5 text-white hover:bg-white/10 hover:text-white';

const MOBILE_LINK_CLASS =
  'rounded-md px-2 py-3 text-sm font-medium text-ink-secondary hover:bg-surface-hover hover:text-brand';

export function Navbar({ intro = false }: { intro?: boolean }) {
  const [open, setOpen] = useState(false);
  const scrolled = useScrolledPast(SCROLL_THRESHOLD_PX);
  const user = useAuth((s) => s.user);
  const isAuthenticated = useAuth((s) => s.isAuthenticated);
  const close = () => setOpen(false);

  const portalPath = getPortalPath(user?.role);
  const portalLabel = getPortalLabel(user?.role);
  const isSignedIn = isAuthenticated && !!user;
  const solid = scrolled || open;

  return (
    <header
      className={cn(
        'fixed inset-x-0 top-0 z-40 border-b transition-colors duration-300',
        // Only the transparent header over the hero takes part in the route morph; the solid,
        // blurred header of a scrolled page fades with the rest of the page instead.
        !solid && '[view-transition-name:landing-nav]',
        intro && 'landing-intro-nav',
        solid ? 'border-line bg-white/90 backdrop-blur-xl' : 'border-white/10 bg-transparent',
      )}
    >
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
        <Logo className="[view-transition-name:brand-logo]" />

        <nav className="hidden items-center gap-8 md:flex" aria-label="Main navigation">
          {NAV_LINKS.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className={cn(
                'text-sm font-medium transition-colors',
                solid ? 'text-ink-secondary hover:text-ink-primary' : 'text-white/75 hover:text-white',
              )}
            >
              {link.label}
            </a>
          ))}
        </nav>

        <div className="hidden items-center gap-2 md:flex">
          <ThemeToggle className={cn('rounded-md', !solid && ON_HERO_TOGGLE)} />
          {isSignedIn ? (
            <CTAButton to={portalPath} className="rounded-md">
              {portalLabel}
              <ArrowRight className="size-4" aria-hidden />
            </CTAButton>
          ) : (
            <>
              <CTAButton
                variant={solid ? 'outline' : 'outlineLight'}
                className="rounded-md border-transparent bg-transparent"
              >
                Sign in
              </CTAButton>
              <CTAButton to="/register" className="rounded-md">
                Get Started
              </CTAButton>
            </>
          )}
        </div>

        <div className="flex items-center gap-1 md:hidden">
          <ThemeToggle className={cn('rounded-md', !solid && ON_HERO_TOGGLE)} />
          <button
            type="button"
            className={cn(
              'rounded-md p-2',
              solid ? 'text-ink-secondary hover:bg-surface-hover' : 'text-white hover:bg-white/10',
            )}
            aria-label={open ? 'Close menu' : 'Open menu'}
            aria-expanded={open}
            onClick={() => setOpen((v) => !v)}
          >
            {open ? <X className="size-6" aria-hidden /> : <Menu className="size-6" aria-hidden />}
          </button>
        </div>
      </div>

      {open && (
        <div className="animate-in fade-in slide-in-from-top-2 border-t border-line px-4 pb-4 md:hidden">
          <nav className="flex flex-col py-2" aria-label="Mobile navigation">
            {NAV_LINKS.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={close}
                className={MOBILE_LINK_CLASS}
              >
                {link.label}
              </a>
            ))}
          </nav>
          <div className="flex flex-col gap-2 pt-1">
            {isSignedIn ? (
              <CTAButton to={portalPath} onClick={close} className="rounded-md">
                {portalLabel}
                <ArrowRight className="size-4" aria-hidden />
              </CTAButton>
            ) : (
              <>
                <CTAButton variant="outline" onClick={close} className="rounded-md">
                  Sign in
                </CTAButton>
                <CTAButton to="/register" onClick={close} className="rounded-md">
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
