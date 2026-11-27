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
  ACTIVE: 'bg-emerald-50 text-emerald-700 [--dot:var(--color-emerald-500)]',
  CONFIRMED: 'bg-emerald-50 text-emerald-700 [--dot:var(--color-emerald-500)]',
  PREVIEWED: 'bg-amber-50 text-amber-700 [--dot:var(--color-amber-500)]',
  PENDING: 'bg-amber-50 text-amber-700 [--dot:var(--color-amber-500)]',
  SUSPENDED: 'bg-red-50 text-red-700 [--dot:var(--color-red-500)]',
  FAILED: 'bg-red-50 text-red-700 [--dot:var(--color-red-500)]',
  LOCKED: 'bg-red-50 text-red-700 [--dot:var(--color-red-500)]',
  INACTIVE: 'bg-line-soft text-ink-muted [--dot:var(--ink-subtle)]',
};

interface Props {
  status: AdminStatus | string;
}

/** Status pill with a colored dot. The DOM text stays the raw status code; CSS presents it in sentence case. */
export function StatusBadge({ status }: Props) {
  // Fallback to INACTIVE style for unknown values instead of crashing
  const tone = (STYLES as Record<string, string>)[status] ?? STYLES.INACTIVE;
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-sm px-1.5 py-0.5 text-[11px] font-medium leading-4',
        tone,
      )}
    >
      <span className="size-1.5 shrink-0 rounded-full bg-[var(--dot)]" aria-hidden />
      <span className="inline-block lowercase first-letter:uppercase">{status}</span>
    </span>
  );
}
