// Advisor appointments page with weekly calendar and searchable list views.

import { useMemo, useState } from 'react';
import type { PaginationState, SortingState } from '@tanstack/react-table';
import { DataTable } from '../../../shared/components/common/DataTable';
import { AppointmentActionModal } from '../../appointment/components/AppointmentActionModal';
import { AdvisorScheduleModal } from '../../appointment/components/AdvisorScheduleModal';
import { AvailabilityEditor } from '../../appointment/components/AvailabilityEditor';
import { WeeklyCalendar } from '../../appointment/components/WeeklyCalendar';
import {
  useAdvisorAppointments,
  useAdvisorAvailability,
  useAllAdvisorAppointments,
} from '../../appointment/hooks/queries/useAppointmentQueries';
import { toDateKey, weekDays } from '../../../shared/lib/appointmentDate';
import type { AdvisorAppointment } from '../../appointment/types/appointment';
import {
  AdvisorAppointmentsHero,
  buildAdvisorAppointmentColumns,
} from '../components/appointments/AdvisorAppointmentsParts';
import {
  AdvisorAppointmentsToolbar,
  type AppointmentsListTab,
  type AppointmentsViewMode,
} from '../components/appointments/AdvisorAppointmentsToolbar';
import { useRequestScheduleDeepLink } from '../hooks/useRequestScheduleDeepLink';

const ACTIVE_STATUSES: AdvisorAppointment['status'][] = ['PENDING', 'ACCEPTED'];
const HISTORY_STATUSES: AdvisorAppointment['status'][] = ['COMPLETED', 'NO_SHOW', 'CANCELLED', 'REJECTED'];

export default function AdvisorAppointments() {
  const [view, setView] = useState<AppointmentsViewMode>('calendar');
  const [weekAnchor, setWeekAnchor] = useState(() => new Date());
  const [selected, setSelected] = useState<AdvisorAppointment | null>(null);
  const [showAvailability, setShowAvailability] = useState(false);
  const schedule = useRequestScheduleDeepLink();

  const [tab, setTab] = useState<AppointmentsListTab>('upcoming');
  const [search, setSearch] = useState('');
  const [pagination, setPagination] = useState<PaginationState>({ pageIndex: 0, pageSize: 10 });
  const [sorting, setSorting] = useState<SortingState>([{ id: 'startTime', desc: false }]);

  const { from, to } = useMemo(() => {
    const days = weekDays(weekAnchor).map(toDateKey);
    return { from: days[0], to: days[6] };
  }, [weekAnchor]);

  const appointmentsQuery = useAdvisorAppointments(from, to);
  const allQuery = useAllAdvisorAppointments();
  const availabilityQuery = useAdvisorAvailability();

  const appointments = appointmentsQuery.data ?? [];
  const allAppointments = useMemo(() => allQuery.data ?? [], [allQuery.data]);

  const stats = useMemo(() => {
    const upcoming = allAppointments.filter((a) => ACTIVE_STATUSES.includes(a.status)).length;
    const pending = allAppointments.filter((a) => a.status === 'PENDING').length;
    const completed = allAppointments.filter((a) => a.status === 'COMPLETED').length;
    return { total: allAppointments.length, upcoming, pending, completed };
  }, [allAppointments]);

  const filtered = useMemo(() => {
    const keyword = search.trim().toLowerCase();
    return allAppointments
      .filter((a) => (tab === 'upcoming' ? ACTIVE_STATUSES.includes(a.status) : HISTORY_STATUSES.includes(a.status)))
      .filter((a) => {
        if (!keyword) return true;
        return (
          (a.studentName ?? '').toLowerCase().includes(keyword) ||
          (a.studentCode ?? '').toLowerCase().includes(keyword) ||
          (a.reason ?? '').toLowerCase().includes(keyword)
        );
      })
      .sort((a, b) =>
        tab === 'upcoming' ? a.startTime.localeCompare(b.startTime) : b.startTime.localeCompare(a.startTime),
      );
  }, [allAppointments, tab, search]);

  const switchTab = (next: AppointmentsListTab) => {
    setTab(next);
    setPagination((p) => ({ ...p, pageIndex: 0 }));
  };

  const columns = useMemo(() => buildAdvisorAppointmentColumns(setSelected), []);
  const pendingCount = appointments.filter((a) => a.status === 'PENDING').length;

  return (
    <div className="w-full space-y-6 pb-4">
      <AdvisorAppointmentsHero
        view={view}
        stats={stats}
        onToggleView={() => setView(view === 'calendar' ? 'list' : 'calendar')}
      />

      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
        <AdvisorAppointmentsToolbar
          view={view}
          onViewChange={setView}
          weekAnchor={weekAnchor}
          onWeekAnchorChange={setWeekAnchor}
          isFetching={appointmentsQuery.isFetching}
          onRefresh={() => appointmentsQuery.refetch()}
          showAvailability={showAvailability}
          onToggleAvailability={() => setShowAvailability((v) => !v)}
          tab={tab}
          onTabChange={switchTab}
          upcomingCount={stats.upcoming}
          historyCount={stats.total - stats.upcoming}
        />

        {view === 'calendar' ? (
          <div className="mt-4">
            {showAvailability && <AvailabilityEditor initialSlots={availabilityQuery.data} />}
            {appointmentsQuery.isError ? (
              <div className="mt-4 flex items-center justify-between rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-600">
                Could not load your appointments.
                <button type="button" onClick={() => appointmentsQuery.refetch()} className="font-semibold hover:underline">
                  Retry
                </button>
              </div>
            ) : (
              <div className={showAvailability ? 'mt-4' : ''}>
                <WeeklyCalendar
                  weekAnchor={weekAnchor}
                  appointments={appointments}
                  isLoading={appointmentsQuery.isLoading}
                  onSelect={setSelected}
                />
                {pendingCount > 0 && (
                  <p className="mt-3 rounded-xl border border-dashed border-[#F26F21]/30 bg-[#fff7f0] px-3 py-2 text-xs text-[#9a4a12]">
                    {pendingCount} yêu cầu đang chờ trong tuần này — bấm vào từng ô để Accept / Reject.
                  </p>
                )}
              </div>
            )}
          </div>
        ) : (
          <div className="mt-4">
            {allQuery.isError ? (
              <div className="rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-600">
                Could not load appointments.{' '}
                <button type="button" onClick={() => allQuery.refetch()} className="font-semibold hover:underline">
                  Retry
                </button>
              </div>
            ) : (
              <DataTable
                columns={columns}
                data={filtered}
                searchKey="studentName"
                searchValue={search}
                searchPlaceholder="Search by student, ID, or reason..."
                emptyText={tab === 'upcoming' ? 'No upcoming appointments.' : 'No history records yet.'}
                getRowId={(row) => row.id}
                isLoading={allQuery.isLoading}
                totalRowCount={filtered.length}
                pagination={pagination}
                onPaginationChange={setPagination}
                sorting={sorting}
                onSortingChange={setSorting}
                onSearchChange={(v) => {
                  setSearch(v);
                  setPagination((p) => ({ ...p, pageIndex: 0 }));
                }}
              />
            )}
          </div>
        )}
      </section>

      <AppointmentActionModal appointment={selected} onClose={() => setSelected(null)} />
      <AdvisorScheduleModal
        open={schedule.context !== null}
        studentId={schedule.context?.studentId ?? null}
        studentName={schedule.context?.studentName ?? null}
        advisingRequestId={schedule.context?.advisingRequestId ?? null}
        onClose={schedule.close}
      />
    </div>
  );
}
