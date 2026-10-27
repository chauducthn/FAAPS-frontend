import { cn } from '@/shared/lib/utils';

interface UserInitialsProps {
  name: string;
  className?: string;
}

export function UserInitials({ name, className }: UserInitialsProps) {
  const initials = name
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(-2)
    .map(part => part.charAt(0).toUpperCase())
    .join('') || '?';

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
