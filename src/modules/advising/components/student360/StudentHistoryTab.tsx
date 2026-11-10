// src/modules/advising/components/student360/StudentHistoryTab.tsx
// The "Advising History" tab of the Student 360 modal: every advising request
// of this student, filtered client-side from the advisor request endpoint.
// The file also exports the appointments list used by the "Appointments" tab.

import { CalendarDays, Clock3, MessageSquareWarning } from 'lucide-react';
import { RequestStatusBadge } from '../RequestStatusBadge';
import { BookingStatusBadge } from '../../../appointment/components/AppointmentBits';
import { formatIsoDay, formatIsoTime } from '../../../../shared/lib/appointmentDate';
import type { AdvisingRequest } from '../../types/advising';
import type { AdvisorAppointment } from '../../../appointment/types/appointment';

interface HistoryProps {
  history: AdvisingRequest[];
  isLoading: boolean;
  isError: boolean;
  onRetry: () => void;
}

export default function StudentHistoryTab({ history, isLoading, isError, onRetry }: HistoryProps) {
  return (
    <div className="space-y-3">
      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="rounded-2xl border border-slate-100 bg-white p-4">
              <div className="h-5 w-24 animate-pulse rounded-lg bg-slate-100" />
              <div className="mt-3 h-4 w-3/4 animate-pulse rounded bg-slate-100" />
              <div className="mt-2 h-3 w-full animate-pulse rounded bg-slate-100" />
            </div>
          ))}
        </div>
      ) : isError ? (
        <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-4 text-sm font-medium text-red-800">
          Could not load advising history.{' '}
          <button type="button" onClick={onRetry} className="font-bold underline">
            Retry
          </button>
        </div>
      ) : history.length === 0 ? (
        <p className="rounded-2xl border border-slate-100 bg-white p-8 text-center text-sm text-slate-500">
          No advising requests from this student yet.
        </p>
      ) : (
        history.map((r) => (
          <article key={r.id} className="rounded-2xl border border-slate-100 bg-white p-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <RequestStatusBadge status={r.status} />
              <span className="text-xs text-slate-400">
                {new Date(r.createdAt).toLocaleDateString('vi-VN')}
              </span>
            </div>
            <h4 className="mt-2 text-sm font-bold text-[#151c27]">{r.title}</h4>
            <p className="mt-1 line-clamp-2 text-[13px] text-slate-600">{r.description}</p>
            <p className="mt-2 text-xs font-medium text-slate-500">
              Type: <span className="text-slate-700">{r.requestType}</span>
            </p>
            {r.resolutionSummary && (
              <p className="mt-2 rounded-lg bg-green-50 px-3 py-2 text-[13px] text-green-800">
                {r.resolutionSummary}
              </p>
            )}
          </article>
        ))
      )}
    </div>
  );
}

/* ---------- Appointments tab (same file: the other "history" surface) ---------- */

interface AppointmentsProps {
  appointments: AdvisorAppointment[];
  isLoading: boolean;
  isError: boolean;
  onRetry: () => void;
}

export function StudentAppointmentsTab({ appointments, isLoading, isError, onRetry }: AppointmentsProps) {
  return (
    <div className="space-y-3">
      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="rounded-2xl border border-slate-100 bg-white p-4">
              <div className="h-5 w-28 animate-pulse rounded-lg bg-slate-100" />
              <div className="mt-3 h-4 w-2/3 animate-pulse rounded bg-slate-100" />
              <div className="mt-2 h-3 w-full animate-pulse rounded bg-slate-100" />
            </div>
          ))}
        </div>
      ) : isError ? (
        <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-4 text-sm font-medium text-red-800">
          Could not load appointments.{' '}
          <button type="button" onClick={onRetry} className="font-bold underline">
            Retry
          </button>
        </div>
      ) : appointments.length === 0 ? (
        <div className="flex flex-col items-center gap-2 rounded-2xl border border-slate-100 bg-white p-8 text-center">
          <span className="flex size-11 items-center justify-center rounded-full bg-slate-100 text-slate-400">
            <CalendarDays className="size-5" aria-hidden />
          </span>
          <p className="text-sm font-semibold text-[#151c27]">No appointments yet</p>
          <p className="text-[13px] text-slate-500">
            Booked sessions with this student will appear here.
          </p>
        </div>
      ) : (
        appointments.map((a) => (
          <article key={a.id} className="rounded-2xl border border-slate-100 bg-white p-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <BookingStatusBadge status={a.status} />
              <span className="flex items-center gap-1.5 text-xs text-slate-400">
                <span className="inline-flex items-center gap-1">
                  <CalendarDays className="size-3.5" aria-hidden />
                  {formatIsoDay(a.startTime)}
                </span>
                <span className="inline-flex items-center gap-1">
                  <Clock3 className="size-3.5" aria-hidden />
                  {formatIsoTime(a.startTime)} – {formatIsoTime(a.endTime)}
                </span>
              </span>
            </div>
            <h4 className="mt-2 text-sm font-bold text-[#151c27]">{a.reason}</h4>
            {a.decisionNote && (
              <p className="mt-2 flex items-start gap-1.5 rounded-xl bg-[#fff7f0] px-3 py-2 text-[13px] leading-relaxed text-[#9a4a12]">
                <MessageSquareWarning className="mt-0.5 size-4 shrink-0" aria-hidden />
                {a.decisionNote}
              </p>
            )}
            {a.consultationSummary && (
              <p className="mt-2 rounded-xl bg-blue-50/60 px-3 py-2 text-[13px] leading-relaxed text-slate-700">
                {a.consultationSummary}
              </p>
            )}
          </article>
        ))
      )}
    </div>
  );
}
