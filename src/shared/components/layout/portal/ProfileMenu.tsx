import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router';
import { CaretDown as ChevronDown, SignOut as LogOut, User as UserRound } from '@phosphor-icons/react';
import { UserAvatar } from '@/shared/components/common/UserAvatar';
import { useAuth } from '../../../../modules/auth/stores/useAuth';
import { authService } from '../../../../modules/auth/services/authService';

interface ProfileMenuProps {
  roleLabel: string;
  profilePath: string;
}

export function ProfileMenu({ roleLabel, profilePath }: ProfileMenuProps) {
  const { user, logout: clearStore } = useAuth();
  const [open, setOpen] = useState(false);
  const [logoutError, setLogoutError] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onDown = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false);
    };
    document.addEventListener('mousedown', onDown);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDown);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  const handleLogout = async () => {
    setLogoutError(false);
    try {
      await authService.logout();
      clearStore();
      window.location.href = '/';
    } catch (error) {
      console.error('Sign-out error', error);
      setLogoutError(true);
    }
  };

  return (
    <div className="flex items-center gap-2">
      {logoutError && (
        <span className="text-sm text-red-600">Unable to sign out. Please try again.</span>
      )}
      <div ref={menuRef} className="relative">
        <button
          type="button"
          onClick={() => setOpen((prev) => !prev)}
          className="flex items-center gap-2 rounded-lg px-2 py-1.5 hover:bg-gray-50"
          aria-expanded={open}
        >
          <UserAvatar
            name={user?.fullName}
            avatarUrl={user?.avatarUrl}
            className="size-8 ring-1 ring-[#e5e7eb]"
            textClassName="text-xs font-semibold"
          />
          <span className="hidden text-left sm:block">
            <span className="block text-sm font-semibold leading-[19px] text-[var(--ink-primary)]">
              {user?.fullName}
            </span>
            <span className="block text-[11px] uppercase leading-4 tracking-[0.05em] text-[var(--ink-muted)]">
              {roleLabel}
            </span>
          </span>
          <ChevronDown className="size-3 text-[var(--ink-muted)]" />
        </button>

        {open && (
          <div className="absolute right-0 top-full mt-2 w-48 rounded-lg border border-[#e5e7eb] bg-white p-1 shadow-md">
            <Link
              to={profilePath}
              onClick={() => setOpen(false)}
              className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm font-medium text-[var(--ink-primary)] hover:bg-gray-50"
            >
              <UserRound className="size-4 text-[var(--ink-muted)]" />
              My Profile
            </Link>
            <button
              type="button"
              onClick={handleLogout}
              className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50"
            >
              <LogOut className="size-4" />
              Sign out
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
