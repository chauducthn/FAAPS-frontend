import { cn } from '@/lib/utils';

interface UserAvatarProps {
  name: string;
  src?: string | null;
  className?: string;
}

export function UserAvatar({ name, src, className }: UserAvatarProps) {
  if (src) {
    return <img src={src} alt="" className={cn('size-8 shrink-0 rounded-md object-cover', className)} />;
  }
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
