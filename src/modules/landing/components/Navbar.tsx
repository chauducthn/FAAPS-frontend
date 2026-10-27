import { useState } from 'react';
import { Menu, X } from 'lucide-react';
import { Logo } from '@/shared/components/common/Logo';
import { CTAButton } from '@/shared/components/common/CTAButton';
import { NAV_LINKS } from './content';

export function Navbar() {
  const [open, setOpen] = useState(false);
  const close = () => setOpen(false);

  return (
    <header className="sticky top-0 z-40 border-b border-gray-200 bg-white/90 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
        <Logo />

        <nav className="hidden items-center gap-8 md:flex" aria-label="Main navigation">
          {NAV_LINKS.map((l) => (
            <a key={l.href} href={l.href} className="text-sm font-medium text-gray-600 hover:text-orange-600">
              {l.label}
            </a>
          ))}
        </nav>

        <div className="hidden items-center gap-3 md:flex">
          <CTAButton variant="outline">Sign in</CTAButton>
          <CTAButton>Get Started</CTAButton>
        </div>

        <button
          type="button"
          className="rounded-md p-2 text-gray-700 hover:bg-gray-100 md:hidden"
          aria-label={open ? 'Close menu' : 'Open menu'}
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
        >
          {open ? <X className="size-6" /> : <Menu className="size-6" />}
        </button>
      </div>

      {open && (
        <div className="border-t border-gray-200 bg-white px-4 pb-4 md:hidden">
          <nav className="flex flex-col py-2" aria-label="Mobile navigation">
            {NAV_LINKS.map((l) => (
              <a
                key={l.href}
                href={l.href}
                onClick={close}
                className="rounded-md px-2 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                {l.label}
              </a>
            ))}
          </nav>
          <div className="flex flex-col gap-2 pt-2">
            <CTAButton variant="outline" onClick={close}>Sign in</CTAButton>
            <CTAButton onClick={close}>Get Started</CTAButton>
          </div>
        </div>
      )}
    </header>
  );
}
