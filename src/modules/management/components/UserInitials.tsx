import { useEffect, useState } from 'react';
import { cn } from '@/shared/lib/utils';

interface UserInitialsProps {
  /** The backend may omit the name — never call `.replace` on undefined. */
  name: string | null | undefined;
  avatarUrl?: string | null;
  className?: string;
}

/** Last two words of the name, ignoring anything in brackets such as "(K18 HCM)". */
export function initialsOf(name: string | null | undefined): string {
  return (
    (name ?? '')
      .replace(/\([^)]*\)/g, ' ')
      .split(/[^\p{L}\p{N}]+/u)
      .filter(Boolean)
      .slice(-2)
      .map((part) => part.charAt(0).toUpperCase())
      .join('') || '?'
  );
}

export function UserInitials({ name, avatarUrl, className }: UserInitialsProps) {
  const [failed, setFailed] = useState(false);
  useEffect(() => {
    setFailed(false);
  }, [avatarUrl]);

  const initials = initialsOf(name);
  const showImage = !!avatarUrl && !failed;

  return (
    <span
      className={cn(
        'flex size-8 shrink-0 items-center justify-center overflow-hidden rounded-full ' +
          'bg-line-soft text-xs font-semibold text-ink-secondary ring-1 ring-inset ring-line',
        className,
      )}
      aria-hidden={!showImage}
    >
      {showImage ? (
        <img
          src={avatarUrl}
          alt={name ? `${name} avatar` : 'User avatar'}
          onError={() => setFailed(true)}
          className="size-full object-cover"
        />
      ) : (
        initials
      )}
    </span>
  );
}
