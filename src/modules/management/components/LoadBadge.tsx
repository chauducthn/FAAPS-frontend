import { cn } from '@/shared/lib/utils';

interface LoadBadgeProps {
  count: number;
  limit: number | null;
  className?: string;
}

/** "12/30" with a warning colour when the advisor is near, at, or over the advisory limit. */
export function LoadBadge({ count, limit, className }: LoadBadgeProps) {
  const over = limit !== null && count > limit;
  const nearOrFull = limit !== null && limit > 0 && count / limit >= 0.8;
  return (
    <span
      className={cn(
        'whitespace-nowrap text-[13px] font-semibold tabular-nums',
        over ? 'text-red-600' : nearOrFull ? 'text-amber-700' : 'text-ink-secondary',
        className,
      )}
      title={over ? `Over the limit by ${count - (limit as number)}` : nearOrFull ? 'Near or at the limit' : undefined}
    >
      {count}/{limit ?? 'no limit'}
    </span>
  );
}
