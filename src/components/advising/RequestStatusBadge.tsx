// src/components/advising/RequestStatusBadge.tsx
// Badge trạng thái yêu cầu tư vấn — dùng chung cho Student Portal và Advisor Portal.
// PENDING → cam, IN_PROGRESS → xanh dương, RESOLVED → xanh lá, CANCELLED → đỏ.

import { cn } from '@/lib/utils';
import type { AdvisingRequestStatus } from '@/types/advising';

const STYLES: Record<AdvisingRequestStatus, { label: string; className: string }> = {
  PENDING: {
    label: 'Đang chờ',
    className: 'bg-orange-100 text-orange-800 ring-orange-200',
  },
  IN_PROGRESS: {
    label: 'Đang xử lý',
    className: 'bg-blue-100 text-blue-800 ring-blue-200',
  },
  RESOLVED: {
    label: 'Đã xử lý',
    className: 'bg-green-100 text-green-800 ring-green-200',
  },
  CANCELLED: {
    label: 'Đã từ chối',
    className: 'bg-red-100 text-red-800 ring-red-200',
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
