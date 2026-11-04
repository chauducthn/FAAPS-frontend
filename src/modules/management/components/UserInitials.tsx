import { cn } from '@/shared/lib/utils';

interface UserInitialsProps {
  name: string;
  className?: string;
}

/** Last two words of the name, ignoring anything in brackets such as "(K18 HCM)". */
export function initialsOf(name: string): string {
  return (
    name
      .replace(/\([^)]*\)/g, ' ')
      .split(/[^\p{L}\p{N}]+/u)
      .filter(Boolean)
      .slice(-2)
      .map(part => part.charAt(0).toUpperCase())
      .join('') || '?'
  );
}

export function UserInitials({ name, className }: UserInitialsProps) {
  const initials = initialsOf(name);

  return (
    <span
      className={cn(
        'flex size-8 shrink-0 items-center justify-center rounded-md bg-orange-100 text-sm font-semibold text-orange-700',
        className
      )}
      aria-hidden="true"
    >
      {initials}
    </span>
  );
}
