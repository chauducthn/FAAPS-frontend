// src/components/appointments/AppointmentBits.tsx
import { cn } from '@/shared/lib/utils';
import type { BookingStatus } from '../types/appointment';

const STATUS_STYLES: Record<BookingStatus, string> = {
  PENDING: 'bg-[#fff7ed] text-[#9a3412]',
  ACCEPTED: 'bg-[#ecfdf5] text-[#047857]',
  REJECTED: 'bg-[#fef2f2] text-[#b91c1c]',
};

export const BOOKING_STATUS_LABEL: Record<BookingStatus, string> = {
  PENDING: 'Pending',
  ACCEPTED: 'Accepted',
  REJECTED: 'Rejected',
};

export function BookingStatusBadge({ status }: { status: BookingStatus }) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide',
        STATUS_STYLES[status],
      )}
    >
      {BOOKING_STATUS_LABEL[status]}
    </span>
  );
}
