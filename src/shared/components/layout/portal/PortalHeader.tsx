import { Menu } from 'lucide-react';
import { ProfileMenu } from './ProfileMenu';

interface PortalHeaderProps {
  roleLabel: string;
  profilePath: string;
  headerExtra?: React.ReactNode;
  onOpenMenu: () => void;
}

export function PortalHeader({
  roleLabel,
  profilePath,
  headerExtra,
  onOpenMenu,
}: PortalHeaderProps) {
  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-[#e5e7eb] bg-white px-4 sm:px-6">
      <button
        type="button"
        className="rounded-md p-2 text-gray-700 hover:bg-gray-100 lg:hidden"
        aria-label="Open menu"
        onClick={onOpenMenu}
      >
        <Menu className="size-6" />
      </button>
      <div className="hidden lg:block" />

      <div className="relative flex items-center gap-2 sm:gap-4">
        {headerExtra}
        <ProfileMenu roleLabel={roleLabel} profilePath={profilePath} />
      </div>
    </header>
  );
}
