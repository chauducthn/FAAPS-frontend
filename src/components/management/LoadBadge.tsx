import { cn } from '@/lib/utils';

interface LoadBadgeProps {
  count: number;
  limit: number | null;
  className?: string;
}

/** "12 / 30" with a warning colour when the advisor is at or over the advisory limit. */
export function LoadBadge({ count, limit, className }: LoadBadgeProps) {
  const over = limit !== null && count > limit;
  const full = limit !== null && count === limit;
  return (
    <span
      className={cn(
        'whitespace-nowrap rounded-full px-2 py-0.5 text-xs font-semibold',
        over ? 'bg-[#fef2f2] text-[#b91c1c]' : full ? 'bg-[#fffbeb] text-[#b45309]' : 'bg-[#f1f5f9] text-[#334155]',
        className
      )}
      title={over ? `Over the limit by ${count - (limit as number)}` : full ? 'At the limit' : undefined}
    >
      {count} / {limit ?? 'no limit'}
      {over ? ' · over limit' : ''}
    </span>
  );
}
