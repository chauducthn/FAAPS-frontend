// src/pages/advising/AdvisorAppointments.tsx
import { useMemo, useState } from 'react';
import { ChevronLeft, ChevronRight, RefreshCw, SlidersHorizontal } from 'lucide-react';
import { AppointmentActionModal } from '../../appointment/components/AppointmentActionModal';
import { AvailabilityEditor } from '../../appointment/components/AvailabilityEditor';
import { WeeklyCalendar, shiftWeek, weekLabel } from '../../appointment/components/WeeklyCalendar';
import { useAdvisorAppointments, useAdvisorAvailability } from '../../appointment/hooks/queries/useAppointmentQueries';
import { toDateKey, weekDays } from '../../../shared/lib/appointmentDate';
import type { AdvisorAppointment } from '../../appointment/types/appointment';

export default function AdvisorAppointments() {
  const [weekAnchor, setWeekAnchor] = useState(() => new Date());
  const [selected, setSelected] = useState<AdvisorAppointment | null>(null);
  const [showAvailability, setShowAvailability] = useState(false);

  const { from, to } = useMemo(() => {
    const days = weekDays(weekAnchor).map(toDateKey);
    return { from: days[0], to: days[6] };
  }, [weekAnchor]);

  const appointmentsQuery = useAdvisorAppointments(from, to);
  const availabilityQuery = useAdvisorAvailability();
  const appointments = appointmentsQuery.data ?? [];

  const pendingCount = appointments.filter((a) => a.status === 'PENDING').length;

  return (
    <div className="mx-auto flex max-w-7xl flex-col gap-5">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-xs text-[#555f6f]">Appointments / Weekly schedule</p>
          <h1 className="mt-1 text-2xl font-semibold text-[#151c27]">My Appointments</h1>
          <p className="mt-1 text-sm text-[#555f6f]">
            {pendingCount > 0
              ? `${pendingCount} pending request${pendingCount === 1 ? '' : 's'} need your response.`
              : 'No pending requests this week.'}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => appointmentsQuery.refetch()}
            disabled={appointmentsQuery.isFetching}
            aria-label="Refresh appointments"
            className="flex size-[38px] items-center justify-center rounded-lg border border-[#e5e7eb] bg-white text-[#555f6f] hover:bg-gray-50 disabled:opacity-60"
          >
            <RefreshCw className={appointmentsQuery.isFetching ? 'size-4 animate-spin' : 'size-4'} />
          </button>
          <button
            type="button"
            onClick={() => setWeekAnchor((d) => shiftWeek(d, -1))}
            aria-label="Previous week"
            className="flex size-[38px] items-center justify-center rounded-lg border border-[#e5e7eb] bg-white text-[#555f6f] hover:bg-gray-50"
          >
            <ChevronLeft className="size-4" />
          </button>
          <span className="min-w-[170px] text-center text-sm font-semibold text-[#151c27]">{weekLabel(weekAnchor)}</span>
          <button
            type="button"
            onClick={() => setWeekAnchor((d) => shiftWeek(d, 1))}
            aria-label="Next week"
            className="flex size-[38px] items-center justify-center rounded-lg border border-[#e5e7eb] bg-white text-[#555f6f] hover:bg-gray-50"
          >
            <ChevronRight className="size-4" />
          </button>
          <button
            type="button"
            onClick={() => setWeekAnchor(new Date())}
            className="h-[38px] rounded-lg border border-[#e5e7eb] bg-white px-3 text-[13px] font-semibold text-[#555f6f] hover:bg-gray-50"
          >
            Today
          </button>
          <button
            type="button"
            onClick={() => setShowAvailability((v) => !v)}
            className="flex h-[38px] items-center gap-1.5 rounded-lg border border-[#e5e7eb] bg-white px-3 text-[13px] font-semibold text-[#555f6f] hover:bg-gray-50"
          >
            <SlidersHorizontal className="size-3.5" />
            Availability
          </button>
        </div>
      </div>

      {showAvailability && <AvailabilityEditor initialSlots={availabilityQuery.data} />}

      {appointmentsQuery.isError ? (
        <div className="flex items-center justify-between rounded-lg border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-600">
          Could not load your appointments.
          <button type="button" onClick={() => appointmentsQuery.refetch()} className="font-semibold hover:underline">
            Retry
          </button>
        </div>
      ) : (
        <WeeklyCalendar
          weekAnchor={weekAnchor}
          appointments={appointments}
          isLoading={appointmentsQuery.isLoading}
          onSelect={setSelected}
        />
      )}

      <AppointmentActionModal appointment={selected} onClose={() => setSelected(null)} />
    </div>
  );
}
