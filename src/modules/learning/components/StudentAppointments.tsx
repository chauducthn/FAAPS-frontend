// Student / Appointments: my appointments (upcoming and history) with cancel and reschedule dialogs.

import { useState } from 'react';
import { cn } from '@/shared/lib/utils';
import { formatIsoDay, formatIsoTime } from '../../../shared/lib/appointmentDate';
import { BookingStatusBadge } from '../../appointment/components/AppointmentBits';
import { StudentAppointmentDetailModal } from '../../appointment/components/StudentAppointmentDetailModal';
import type { BookedAppointment } from '../../appointment/types/appointment';
import { CancelAppointmentModal, RescheduleAppointmentModal } from './StudentAppointmentModals';

const isOpen = (item: BookedAppointment) => item.status === 'PENDING' || item.status === 'ACCEPTED';
const isUpcoming = (item: BookedAppointment, now: number) => isOpen(item) && new Date(item.endTime).getTime() >= now;

export function StudentAppointments({
  appointments,
  isLoading,
  isError,
  onRetry,
}: {
  appointments: BookedAppointment[] | undefined;
  isLoading: boolean;
  isError: boolean;
  onRetry: () => void;
}) {
  const [tab, setTab] = useState<'upcoming' | 'history'>('upcoming');
  const [detailId, setDetailId] = useState<string | null>(null);
  const [cancelling, setCancelling] = useState<BookedAppointment | null>(null);
  const [rescheduling, setRescheduling] = useState<BookedAppointment | null>(null);

  const now = Date.now();
  const all = [...(appointments ?? [])];
  const upcoming = all.filter((item) => isUpcoming(item, now)).sort((a, b) => a.startTime.localeCompare(b.startTime));
  const history = all.filter((item) => !isUpcoming(item, now)).sort((a, b) => b.startTime.localeCompare(a.startTime));
  const visible = tab === 'upcoming' ? upcoming : history;

  return (
    <section className="rounded-xl bg-white shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#f1f5f9] px-5 py-4">
        <div>
          <h2 className="text-sm font-semibold text-[#151c27]">My Appointments</h2>
          <p className="mt-0.5 text-[13px] text-[#555f6f]">Track, reschedule or cancel your sessions with your advisor.</p>
        </div>
        <div className="inline-flex rounded-lg bg-[#f1f5f9] p-0.5" role="tablist" aria-label="Appointment list">
          {(
            [
              ['upcoming', `Upcoming (${upcoming.length})`],
              ['history', `History (${history.length})`],
            ] as const
          ).map(([key, label]) => (
            <button
              key={key}
              type="button"
              role="tab"
              aria-selected={tab === key}
              onClick={() => setTab(key)}
              className={cn(
                'rounded-md px-3 py-1.5 text-[13px] font-semibold transition-colors',
                tab === key ? 'bg-white text-[#F26F21] shadow-sm' : 'text-[#555f6f] hover:text-[#151c27]',
              )}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {isLoading ? (
        <div className="space-y-3 p-5">
          {Array.from({ length: 2 }).map((_, i) => (
            <div key={i} className="h-14 animate-pulse rounded-lg bg-gray-100" />
          ))}
        </div>
      ) : isError ? (
        <div className="flex flex-col items-center gap-2 px-5 py-10 text-center">
          <p className="text-sm font-semibold text-[#151c27]">Unable to load your appointments</p>
          <button
            type="button"
            onClick={onRetry}
            className="rounded-lg border border-[#e5e7eb] px-3 py-1.5 text-[13px] font-semibold text-[#555f6f] hover:bg-gray-50"
          >
            Try again
          </button>
        </div>
      ) : visible.length === 0 ? (
        <p className="px-5 py-10 text-center text-sm text-[#555f6f]">
          {tab === 'upcoming' ? 'No upcoming appointments. Book one above.' : 'No past appointments yet.'}
        </p>
      ) : (
        <ul className="divide-y divide-[#f1f5f9]">
          {visible.map((item) => (
            <li key={item.id} className="px-5 py-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-[#151c27]">
                    {formatIsoDay(item.startTime)} · {formatIsoTime(item.startTime)} – {formatIsoTime(item.endTime)}
                  </p>
                  <p className="mt-0.5 text-[13px] text-[#555f6f]">{item.advisorName}</p>
                  {item.reason && <p className="mt-1 line-clamp-2 text-[13px] text-[#555f6f]">{item.reason}</p>}
                </div>
                <BookingStatusBadge status={item.status} />
              </div>
              <div className="mt-3 flex flex-wrap items-center gap-4 text-[13px] font-semibold">
                <button type="button" className="text-[#F26F21] hover:underline" onClick={() => setDetailId(item.id)}>
                  View details
                </button>
                {isOpen(item) && (
                  <>
                    <button type="button" className="text-[#555f6f] hover:underline" onClick={() => setRescheduling(item)}>
                      Reschedule
                    </button>
                    <button type="button" className="text-red-600 hover:underline" onClick={() => setCancelling(item)}>
                      Cancel
                    </button>
                  </>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}

      <StudentAppointmentDetailModal id={detailId} onClose={() => setDetailId(null)} />
      <CancelAppointmentModal item={cancelling} onClose={() => setCancelling(null)} />
      <RescheduleAppointmentModal item={rescheduling} onClose={() => setRescheduling(null)} />
    </section>
  );
}
