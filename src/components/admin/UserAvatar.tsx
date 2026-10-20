import { cn } from '@/lib/utils';

interface UserAvatarProps {
  name: string;
  className?: string;
}

export function UserAvatar({ name, className }: UserAvatarProps) {
  return (
    <span
      className={cn(
        'flex size-8 shrink-0 items-center justify-center rounded-md bg-orange-100 text-sm font-semibold text-orange-700',
        className
      )}
      aria-hidden="true"
    >
      {name.trim().charAt(0).toUpperCase() || '?'}
    </span>
  );
}
