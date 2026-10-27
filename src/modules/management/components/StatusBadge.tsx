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
  ACTIVE: 'bg-[#ecfdf5] text-[#047857]',
  CONFIRMED: 'bg-[#ecfdf5] text-[#047857]',
  PREVIEWED: 'bg-[#fff7ed] text-[#9a3412]',
  PENDING: 'bg-[#fff7ed] text-[#9a3412]',
  SUSPENDED: 'bg-[#fef2f2] text-[#b91c1c]',
  FAILED: 'bg-[#fef2f2] text-[#b91c1c]',
  LOCKED: 'bg-[#fef2f2] text-[#b91c1c]',
  INACTIVE: 'bg-gray-100 text-[#555f6f]',
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
        'inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-bold uppercase tracking-[0.02em]',
        tone,
      )}
    >
      {status}
    </span>
  );
}