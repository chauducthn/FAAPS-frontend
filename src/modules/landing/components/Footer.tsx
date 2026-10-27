import { Logo } from '@/shared/components/common/Logo';
import { NAV_LINKS } from './content';

export function Footer() {
  return (
    <footer className="border-t border-gray-200 bg-gray-50">
      <div className="mx-auto flex max-w-6xl flex-col items-center gap-4 px-4 py-8 text-center sm:px-6 md:flex-row md:justify-between md:text-left">
        <Logo />
        <nav className="flex flex-wrap justify-center gap-x-6 gap-y-2" aria-label="Footer links">
          {NAV_LINKS.map((l) => (
            <a key={l.href} href={l.href} className="text-sm text-gray-600 hover:text-orange-600">
              {l.label}
            </a>
          ))}
        </nav>
        <p className="text-xs text-gray-500">© {new Date().getFullYear()} FAAPS. All rights reserved.</p>
      </div>
    </footer>
  );
}
