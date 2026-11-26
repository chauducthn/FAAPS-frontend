import { List as Menu } from '@phosphor-icons/react';
import { ThemeToggle } from '@/shared/components/common/ThemeToggle';
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

        {activeItem && (
          <div className="min-w-0">
            <p className="truncate text-[15px] font-bold leading-snug tracking-tight text-gray-900">
              {activeItem.label}
            </p>
            {activeItem.description && (
              <p className="hidden truncate text-xs text-gray-500 sm:block">
                {activeItem.description}
              </p>
            )}
          </div>
        )}
      </div>

      <div className="relative flex shrink-0 items-center gap-2 sm:gap-3">
        <ThemeToggle />
        {headerExtra}
        <ProfileMenu roleLabel={roleLabel} profilePath={profilePath} />
      </div>
    </header>
  );
}
