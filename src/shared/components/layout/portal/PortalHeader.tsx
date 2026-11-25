import { Menu } from 'lucide-react';
import { ProfileMenu } from './ProfileMenu';
import type { PortalNavItem } from './PortalSidebar';

interface PortalHeaderProps {
  roleLabel: string;
  profilePath: string;
  activeItem?: PortalNavItem;
  headerExtra?: React.ReactNode;
  onOpenMenu: () => void;
}

export function PortalHeader({
  roleLabel,
  profilePath,
  activeItem,
  headerExtra,
  onOpenMenu,
}: PortalHeaderProps) {
  const ActiveIcon = activeItem?.icon;

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between gap-4 border-b border-[#e5e7eb] bg-white px-4 sm:px-6">
      <div className="flex min-w-0 items-center gap-3">
        <button
          type="button"
          className="shrink-0 rounded-md p-2 text-gray-700 hover:bg-gray-100 lg:hidden"
          aria-label="Open menu"
          onClick={onOpenMenu}
        >
          <Menu className="size-6" />
        </button>

        {activeItem && ActiveIcon && (
          <div className="flex min-w-0 items-center gap-3">
            <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-[var(--brand)] text-white shadow-[0_2px_8px_rgba(242,111,33,0.3)]">
              <ActiveIcon className="size-4.5" aria-hidden />
            </span>
            <div className="min-w-0">
              <p className="truncate text-sm font-bold leading-tight tracking-tight text-gray-900 sm:text-base">
                {activeItem.label}
              </p>
              {activeItem.description && (
                <p className="hidden truncate text-xs text-gray-500 sm:block">
                  {activeItem.description}
                </p>
              )}
            </div>
          </div>
        )}
      </div>

      <div className="relative flex shrink-0 items-center gap-2 sm:gap-4">
        {headerExtra}
        <ProfileMenu roleLabel={roleLabel} profilePath={profilePath} />
      </div>
    </header>
  );
}
