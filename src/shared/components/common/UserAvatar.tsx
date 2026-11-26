import { useEffect, useState } from 'react';
import { User as UserRound } from '@phosphor-icons/react';
import { cn } from '@/shared/lib/utils';

export function initialsOf(name?: string | null): string {
  const parts = (name ?? '').trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return '';
  return parts
    .slice(-2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('');
}

interface UserAvatarProps {
  name?: string | null;
  avatarUrl?: string | null;
  className?: string;
  textClassName?: string;
  fallbackIconClassName?: string;
}

export function UserAvatar({
  name,
  avatarUrl,
  className,
  textClassName,
  fallbackIconClassName,
}: UserAvatarProps) {
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    setFailed(false);
  }, [avatarUrl]);

  const initials = initialsOf(name);
  const showImage = !!avatarUrl && !failed;

  return (
    <span
      className={cn(
        'relative inline-flex shrink-0 items-center justify-center overflow-hidden rounded-full bg-orange-100 font-semibold text-[#C2410C] ring-1 ring-inset ring-black/5',
        className,
      )}
    >
      {showImage ? (
        <img
          src={avatarUrl}
          alt={name ? `${name} avatar` : 'User avatar'}
          onError={() => setFailed(true)}
          className="size-full object-cover"
        />
      ) : initials ? (
        <span className={cn('select-none leading-none', textClassName)}>{initials}</span>
      ) : (
        <UserRound className={cn('size-4', fallbackIconClassName)} aria-hidden />
      )}
    </span>
  );
}
