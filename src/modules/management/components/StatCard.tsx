import type { Icon as LucideIcon } from '@phosphor-icons/react';
import { cn } from '@/shared/lib/utils';

interface StatCardProps {
  label: string;
  value?: number;
  icon: LucideIcon;
  iconClassName: string;
  isLoading?: boolean;
}

export function StatCard({ label, value, icon: Icon, iconClassName, isLoading }: StatCardProps) {
  return (
    <div className="flex flex-col gap-4 rounded-lg bg-white p-6 shadow-sm">
      <div className="flex items-center gap-3">
        <span className={cn('flex size-10 items-center justify-center rounded-full', iconClassName)}>
          <Icon className="size-5" />
        </span>
        <p className="text-[13px] text-ink-muted">{label}</p>
      </div>
      {isLoading ? (
        <div className="h-10 w-24 animate-pulse rounded bg-line-soft" />
      ) : (
        <p className="text-[32px] font-bold leading-10 text-ink-primary">
          {value === undefined ? '—' : value.toLocaleString('en-US')}
        </p>
      )}
    </div>
  );
}
