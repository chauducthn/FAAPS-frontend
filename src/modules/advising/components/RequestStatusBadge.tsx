// src/modules/advising/components/RequestStatusBadge.tsx
// Ticket status badge for advising requests — shared by the Student and Advisor portals.
// PENDING → yellow, IN_PROGRESS → blue, RESOLVED → green, REJECTED → red, CANCELLED → slate.

import { cn } from '@/shared/lib/utils';
import type { AdvisingRequestStatus } from '@/modules/advising/types/advising';

const STYLES: Record<AdvisingRequestStatus, { label: string; className: string }> = {
  PENDING: {
    label: 'Pending',
    className: 'bg-amber-100 text-amber-800 ring-amber-300',
  },
  IN_PROGRESS: {
    label: 'In Progress',
    className: 'bg-blue-100 text-blue-800 ring-blue-300',
  },
  RESOLVED: {
    label: 'Resolved',
    className: 'bg-emerald-100 text-emerald-800 ring-emerald-300',
  },
  REJECTED: {
    label: 'Rejected',
    className: 'bg-red-100 text-red-800 ring-red-300',
  },
  CANCELLED: {
    label: 'Cancelled',
    className: 'bg-slate-100 text-slate-600 ring-slate-300',
  },
};

export function RequestStatusBadge({
  status,
  className,
  cancelledLabel,
}: {
  status: AdvisingRequestStatus;
  className?: string;
  /** Override for CANCELLED — e.g. "Rejected" on the advisor side. */
  cancelledLabel?: string;
}) {
  const style = STYLES[status] ?? STYLES.PENDING;
  const label = status === 'CANCELLED' && cancelledLabel ? cancelledLabel : style.label;

  return (
    <span
      className={cn(
        'inline-flex shrink-0 items-center rounded-full px-2.5 py-0.5 text-[11px] font-bold ring-1 ring-inset',
        style.className,
        className,
      )}
    >
      {label}
    </span>
  );
}
