import type { Ref } from 'react';
import { List as Menu } from '@phosphor-icons/react';
import { Logo } from '@/shared/components/common/Logo';
import { ThemeToggle } from '@/shared/components/common/ThemeToggle';
import { cn } from '@/shared/lib/utils';
import { HeaderAccount } from './HeaderAccount';
import type { PortalNavItem } from './PortalSidebar';

const HEADER_CLASS =
  'sticky top-0 z-30 flex h-16 items-center justify-between gap-4 border-b border-line bg-white/90 px-4 ' +
  'backdrop-blur-md sm:px-8';

/** Holds the logo (about 89px wide) plus a 32px gap to the title while the sidebar is collapsed; desktop only. */
const LOGO_SLOT_CLASS = 'hidden shrink-0 lg:block motion-safe:transition-[width] motion-safe:duration-200';

/** The theme toggle matches the borderless icon buttons of the header. */
const THEME_TOGGLE_CLASS =
  'rounded-md border-transparent bg-transparent text-ink-muted hover:bg-line-soft hover:text-ink-primary';

interface PortalHeaderProps {
  roleLabel: string;
  activeItem?: PortalNavItem;
  headerExtra?: React.ReactNode;
  homePath: string;
  /** True while the sidebar is collapsed: the logo then sits before the page title. */
  showLogo: boolean;
  logoRef: Ref<HTMLDivElement>;
  onOpenMenu: () => void;
  onOpenProfile: () => void;
}

export function PortalHeader({
  roleLabel,
  activeItem,
  headerExtra,
  homePath,
  showLogo,
  logoRef,
  onOpenMenu,
  onOpenProfile,
}: PortalHeaderProps) {
  return (
    <header className={HEADER_CLASS}>
      <div className="flex min-w-0 items-center gap-3">
        <button
          type="button"
          className="shrink-0 rounded-md p-2 text-ink-secondary hover:bg-line-soft lg:hidden"
          aria-label="Open menu"
          onClick={onOpenMenu}
        >
          <Menu className="size-6" />
        </button>

        <div className="flex min-w-0 items-center">
          <div className={cn(LOGO_SLOT_CLASS, showLogo ? 'w-30' : 'w-0')}>
            {showLogo && (
              <div ref={logoRef} className="flex w-max items-center">
                <Logo to={homePath} />
              </div>
            )}
          </div>

          {activeItem && (
            <div className="min-w-0">
              <p className="truncate text-[15px] font-semibold leading-snug tracking-[-0.01em] text-ink-primary">
                {activeItem.label}
              </p>
              {activeItem.description && (
                <p className="hidden truncate text-xs text-ink-subtle sm:block">
                  {activeItem.description}
                </p>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="relative flex shrink-0 items-center gap-1 sm:gap-1.5">
        <ThemeToggle className={THEME_TOGGLE_CLASS} />
        {headerExtra}
        <span className="mx-1.5 h-6 w-px bg-line" aria-hidden />
        <HeaderAccount roleLabel={roleLabel} onOpenProfile={onOpenProfile} />
      </div>
    </header>
  );
}
