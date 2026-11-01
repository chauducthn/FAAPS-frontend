// src/components/advising/RequestStatusBadge.tsx
// Badge trạng thái yêu cầu tư vấn — dùng chung cho Student Portal và Advisor Portal.
// PENDING → cam, IN_PROGRESS → xanh dương, RESOLVED → xanh lá, CANCELLED → đỏ.

import { cn } from '@/shared/lib/utils';
import type { AdvisingRequestStatus } from '@/modules/advising/types/advising';

const STYLES: Record<AdvisingRequestStatus, { label: string; className: string }> = {
  PENDING: {
    label: 'Pending',
    className: 'bg-orange-200 text-orange-950 ring-orange-400',
  },
  IN_PROGRESS: {
    label: 'In progress',
    className: 'bg-blue-200 text-blue-950 ring-blue-400',
  },
  RESOLVED: {
    label: 'Resolved',
    className: 'bg-emerald-200 text-emerald-950 ring-emerald-400',
  },
  CANCELLED: {
    label: 'Rejected',
    className: 'bg-red-200 text-red-950 ring-red-400',
  },
};

export function RequestStatusBadge({
  status,
  className,
}: {
  status: AdvisingRequestStatus;
  className?: string;
}) {
  const style = STYLES[status] ?? STYLES.PENDING;

  return (
    <span
      className={cn(
        'inline-flex shrink-0 items-center rounded-full px-2.5 py-0.5 text-[11px] font-semibold ring-1 ring-inset',
        style.className,
        className,
      )}
    >
      {style.label}
    </span>
  );
}
