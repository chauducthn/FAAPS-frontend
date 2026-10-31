// src/components/appointments/AppointmentBits.tsx
import { cn } from '@/shared/lib/utils';
import type { BookingStatus } from '../types/appointment';

const STATUS_STYLES: Record<BookingStatus, string> = {
  PENDING: 'bg-[#fff7ed] text-[#9a3412]',
  ACCEPTED: 'bg-[#ecfdf5] text-[#047857]',
  REJECTED: 'bg-[#fef2f2] text-[#b91c1c]',
  CANCELLED: 'bg-slate-100 text-slate-600',
  COMPLETED: 'bg-blue-50 text-blue-700',
  NO_SHOW: 'bg-purple-50 text-purple-700',
};

export const BOOKING_STATUS_LABEL: Record<BookingStatus, string> = {
  PENDING: 'Pending',
  ACCEPTED: 'Accepted',
  REJECTED: 'Rejected',
  CANCELLED: 'Cancelled',
  COMPLETED: 'Completed',
  NO_SHOW: 'No-show',
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
