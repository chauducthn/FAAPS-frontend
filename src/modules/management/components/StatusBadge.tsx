import { cn } from '@/shared/lib/utils';

export type AdminStatus =
  | 'ACTIVE'
  | 'INACTIVE'
  | 'SUSPENDED'
  | 'LOCKED'
  | 'PENDING'
  | 'CONFIRMED'
  | 'PREVIEWED'
  | 'FAILED';

const STYLES: Record<AdminStatus, string> = {
  ACTIVE: 'text-emerald-700',
  CONFIRMED: 'text-emerald-700',
  PREVIEWED: 'text-amber-700',
  PENDING: 'text-amber-700',
  SUSPENDED: 'text-red-600',
  FAILED: 'text-red-600',
  LOCKED: 'text-red-600',
  INACTIVE: 'text-gray-500',
};

interface Props {
  status: AdminStatus | string;
}

export function StatusBadge({ status }: Props) {
  // Fallback to INACTIVE style for unknown values instead of crashing
  const tone = (STYLES as Record<string, string>)[status] ?? STYLES.INACTIVE;
  return (
    <span
      className={cn(
        'inline-flex items-center text-xs font-semibold uppercase tracking-[0.02em]',
        tone,
      )}
    >
      {status}
    </span>
  );
}