import { SignOut, UserCircle } from '@phosphor-icons/react';
import { UserAvatar } from '@/shared/components/common/UserAvatar';
import { useSignOut } from '@/shared/hooks/useSignOut';
import { cn } from '@/shared/lib/utils';
import { useAuth } from '../../../../modules/auth/stores/useAuth';

interface HeaderAccountProps {
  roleLabel: string;
  /** Opens the profile drawer. */
  onOpenProfile: () => void;
}

const ICON_BUTTON =
  'inline-flex size-9 items-center justify-center rounded-md text-ink-muted transition-colors hover:bg-line-soft ' +
  'hover:text-ink-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/40 [&_svg]:size-[18px]';

const AVATAR_TRIGGER =
  'flex items-center gap-2.5 rounded-md py-1 pl-1 pr-2 transition-colors hover:bg-line-soft focus-visible:outline-none ' +
  'focus-visible:ring-2 focus-visible:ring-brand/40';

/** Right side of the portal header: My profile, Sign out and the avatar that opens the profile drawer. */
export function HeaderAccount({ roleLabel, onOpenProfile }: HeaderAccountProps) {
  const user = useAuth((state) => state.user);
  const { signOut, error } = useSignOut();
  const avatarLabel = `Open profile of ${user?.fullName ?? 'the current user'}`;

  return (
    <div className="flex items-center gap-1">
      {error && <span className="mr-2 hidden text-xs text-red-600 md:inline">Unable to sign out. Please try again.</span>}

      <button type="button" onClick={onOpenProfile} aria-label="My profile" title="My profile" className={ICON_BUTTON}>
        <UserCircle aria-hidden />
      </button>
      <button
        type="button"
        onClick={signOut}
        aria-label="Sign out"
        title="Sign out"
        className={cn(ICON_BUTTON, 'hover:bg-red-50 hover:text-red-600')}
      >
        <SignOut aria-hidden />
      </button>

      <span className="mx-1.5 h-6 w-px bg-line" aria-hidden />

      <button type="button" onClick={onOpenProfile} aria-label={avatarLabel} title={avatarLabel} className={AVATAR_TRIGGER}>
        <UserAvatar
          name={user?.fullName}
          avatarUrl={user?.avatarUrl}
          className="size-8 rounded-full ring-1 ring-line"
          textClassName="text-xs font-semibold"
        />
        <span className="hidden text-left sm:block">
          <span className="block max-w-40 truncate text-[13px] font-semibold leading-tight text-ink-primary">
            {user?.fullName}
          </span>
          <span className="block text-[11px] uppercase leading-4 tracking-[0.06em] text-ink-subtle">{roleLabel}</span>
        </span>
      </button>
    </div>
  );
}
