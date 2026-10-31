// src/pages/advising/AdvisorAppointments.tsx
// Quản lý lịch hẹn — hero cam FPT + stat cards + view switcher (Calendar / List)
// + List view (Upcoming / History tabs, DataTable) + WeeklyCalendar được bảo tồn 100%.

import { useMemo, useState } from 'react';
import {
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  CircleCheckBig,
  Clock3,
  LayoutList,
  RefreshCw,
  SlidersHorizontal,
  UsersRound,
} from 'lucide-react';
import type { PaginationState, SortingState } from '@tanstack/react-table';
import { DataTable, type DataTableColumnDef } from '../../../shared/components/common/DataTable';
import { AppointmentActionModal } from '../../appointment/components/AppointmentActionModal';
import { AvailabilityEditor } from '../../appointment/components/AvailabilityEditor';
import { WeeklyCalendar, shiftWeek, weekLabel } from '../../appointment/components/WeeklyCalendar';
import { BookingStatusBadge } from '../../appointment/components/AppointmentBits';
import {
  useAdvisorAppointments,
  useAdvisorAvailability,
  useAllAdvisorAppointments,
} from '../../appointment/hooks/queries/useAppointmentQueries';
import { formatIsoDay, formatIsoTime, toDateKey, weekDays } from '../../../shared/lib/appointmentDate';
import type { AdvisorAppointment } from '../../appointment/types/appointment';
import { cn } from '@/shared/lib/utils';

type ViewMode = 'calendar' | 'list';
type ListTab = 'upcoming' | 'history';

const ACTIVE_STATUSES: AdvisorAppointment['status'][] = ['PENDING', 'ACCEPTED'];
const HISTORY_STATUSES: AdvisorAppointment['status'][] = ['COMPLETED', 'NO_SHOW', 'CANCELLED', 'REJECTED'];

function initialsOf(name: string) {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(-2)
    .map((part) => part[0]?.toUpperCase())
    .join('');
}

export default function AdvisorAppointments() {
  const [view, setView] = useState<ViewMode>('calendar');
  const [weekAnchor, setWeekAnchor] = useState(() => new Date());
  const [selected, setSelected] = useState<AdvisorAppointment | null>(null);
  const [showAvailability, setShowAvailability] = useState(false);

  // List-view state
  const [tab, setTab] = useState<ListTab>('upcoming');
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
          a.studentName.toLowerCase().includes(keyword) ||
          (a.studentCode ?? '').toLowerCase().includes(keyword) ||
          a.reason.toLowerCase().includes(keyword)
        );
      })
      .sort((a, b) =>
        tab === 'upcoming' ? a.startTime.localeCompare(b.startTime) : b.startTime.localeCompare(a.startTime),
      );
  }, [allAppointments, tab, search]);

  const switchTab = (next: ListTab) => {
    setTab(next);
    setPagination((p) => ({ ...p, pageIndex: 0 }));
  };

  const columns = useMemo<DataTableColumnDef<AdvisorAppointment>[]>(
    () => [
      {
        accessorKey: 'studentName',
        header: 'Student',
        cell: ({ row }) => {
          const a = row.original;
          return (
            <div className="flex min-w-0 items-center gap-3">
              <span
                aria-hidden
                className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-[#F26F21] to-[#ff9a4d] text-[13px] font-bold text-white shadow-sm"
              >
                {initialsOf(a.studentName)}
              </span>
              <div className="min-w-0">
                <button
                  type="button"
                  onClick={() => setSelected(a)}
                  className="block max-w-full truncate text-left text-sm font-semibold text-[#151c27] hover:text-[#F26F21] hover:underline"
                >
                  {a.studentName}
                </button>
                <p className="mt-0.5 truncate text-xs text-slate-400">
                  {a.studentCode ?? '—'} · {formatIsoDay(a.startTime)}
                </p>
              </div>
            </div>
          );
        },
      },
      {
        accessorKey: 'startTime',
        header: 'Schedule',
        cell: ({ row }) => {
          const a = row.original;
          return (
            <div>
              <p className="flex items-center gap-1.5 text-sm font-bold text-[#151c27]">
                <CalendarDays className="size-3.5 text-[#F26F21]" aria-hidden />
                {formatIsoDay(a.startTime)}
              </p>
              <p className="mt-1 flex items-center gap-1.5 text-xs text-slate-500">
                <Clock3 className="size-3.5 text-slate-400" aria-hidden />
                {formatIsoTime(a.startTime)} – {formatIsoTime(a.endTime)}
              </p>
            </div>
          );
        },
      },
      {
        accessorKey: 'reason',
        header: 'Reason',
        enableSorting: false,
        cell: ({ row }) => (
          <p className="max-w-64 truncate text-[13px] text-slate-600" title={row.original.reason}>
            {row.original.reason}
          </p>
        ),
      },
      {
        accessorKey: 'status',
        header: 'Status',
        enableSorting: false,
        cell: ({ row }) => <BookingStatusBadge status={row.original.status} />,
      },
      {
        id: 'actions',
        header: 'Actions',
        enableSorting: false,
        meta: { align: 'right' },
        cell: ({ row }) => (
          <div className="flex justify-end">
            <button
              type="button"
              onClick={() => setSelected(row.original)}
              className="rounded-lg bg-[#F26F21] px-3 py-1.5 text-xs font-bold text-white shadow-sm transition-colors hover:bg-[#d95f14]"
            >
              Details
            </button>
          </div>
        ),
      },
    ],
    [],
  );

  const pendingCount = appointments.filter((a) => a.status === 'PENDING').length;

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-5">
      {/* Hero cam FPT — đồng bộ My Students */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#F26F21] to-[#ff8f3f] p-6 text-white shadow-sm">
        <div aria-hidden className="pointer-events-none absolute -right-12 -top-16 size-56 rounded-full bg-white/10" />
        <div aria-hidden className="pointer-events-none absolute -bottom-20 right-40 size-36 rounded-full bg-white/10" />
        <div className="relative">
          <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-white/80">
            Advisor / Appointments
          </p>
          <h1 className="mt-1 flex items-center gap-2 text-2xl font-bold">
            <UsersRound className="size-6" aria-hidden />
            My Appointments
          </h1>
          <p className="mt-1 text-[13px] text-white/85">
            {stats.pending > 0
              ? `${stats.pending} pending request${stats.pending === 1 ? '' : 's'} need your response.`
              : 'No pending requests right now. Nice work!'}
          </p>
          <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
            {[
              { label: 'Total', value: String(stats.total) },
              { label: 'Upcoming', value: String(stats.upcoming) },
              { label: 'Pending', value: String(stats.pending) },
              { label: 'Completed', value: String(stats.completed) },
            ].map((s) => (
              <div key={s.label} className="rounded-xl bg-white/15 px-3 py-2.5 backdrop-blur-sm">
                <p className="text-[11px] font-medium text-white/80">{s.label}</p>
                <p className="mt-0.5 text-xl font-bold tabular-nums">{s.value}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Toolbar: view switcher + calendar nav / list tabs */}
      <section className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm sm:p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          {/* Calendar / List switcher */}
          <div className="inline-flex rounded-xl bg-slate-100 p-1" role="tablist" aria-label="View mode">
            {(
              [
                { key: 'calendar', label: 'Calendar', icon: CalendarDays },
                { key: 'list', label: 'List', icon: LayoutList },
              ] as const
            ).map((v) => {
              const active = view === v.key;
              const Icon = v.icon;
              return (
                <button
                  key={v.key}
                  type="button"
                  role="tab"
                  aria-selected={active}
                  onClick={() => setView(v.key)}
                  className={cn(
                    'flex h-9 items-center gap-1.5 rounded-lg px-4 text-[13px] font-bold transition-all',
                    active ? 'bg-white text-[#F26F21] shadow-sm' : 'text-slate-500 hover:text-slate-800',
                  )}
                >
                  <Icon className="size-4" aria-hidden />
                  {v.label}
                </button>
              );
            })}
          </div>

          {view === 'calendar' ? (
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => appointmentsQuery.refetch()}
                disabled={appointmentsQuery.isFetching}
                aria-label="Refresh appointments"
                className="flex size-[38px] items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-500 hover:bg-gray-50 disabled:opacity-60"
              >
                <RefreshCw className={appointmentsQuery.isFetching ? 'size-4 animate-spin' : 'size-4'} />
              </button>
              <button
                type="button"
                onClick={() => setWeekAnchor((d) => shiftWeek(d, -1))}
                aria-label="Previous week"
                className="flex size-[38px] items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-500 hover:bg-gray-50"
              >
                <ChevronLeft className="size-4" />
              </button>
              <span className="min-w-[170px] text-center text-sm font-semibold text-[#151c27]">
                {weekLabel(weekAnchor)}
              </span>
              <button
                type="button"
                onClick={() => setWeekAnchor((d) => shiftWeek(d, 1))}
                aria-label="Next week"
                className="flex size-[38px] items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-500 hover:bg-gray-50"
              >
                <ChevronRight className="size-4" />
              </button>
              <button
                type="button"
                onClick={() => setWeekAnchor(new Date())}
                className="h-[38px] rounded-lg border border-slate-200 bg-white px-3 text-[13px] font-semibold text-slate-500 hover:bg-gray-50"
              >
                Today
              </button>
              <button
                type="button"
                onClick={() => setShowAvailability((v) => !v)}
                aria-pressed={showAvailability}
                className={cn(
                  'flex h-[38px] items-center gap-1.5 rounded-lg border px-3 text-[13px] font-semibold transition-colors',
                  showAvailability
                    ? 'border-[#F26F21] bg-[#fff3ea] text-[#F26F21]'
                    : 'border-slate-200 bg-white text-slate-500 hover:bg-gray-50',
                )}
              >
                <SlidersHorizontal className="size-3.5" />
                Availability
              </button>
            </div>
          ) : (
            <div className="flex flex-wrap items-center gap-2" role="tablist" aria-label="Appointment period">
              {(
                [
                  { key: 'upcoming', label: `Upcoming (${stats.upcoming})`, icon: Clock3 },
                  { key: 'history', label: `History (${stats.total - stats.upcoming})`, icon: CircleCheckBig },
                ] as const
              ).map((t) => {
                const active = tab === t.key;
                const Icon = t.icon;
                return (
                  <button
                    key={t.key}
                    type="button"
                    role="tab"
                    aria-selected={active}
                    onClick={() => switchTab(t.key)}
                    className={cn(
                      'inline-flex h-9 items-center gap-1.5 rounded-full px-4 text-[13px] font-bold ring-1 ring-inset transition-colors',
                      active
                        ? 'bg-[#F26F21] text-white ring-[#F26F21]'
                        : 'bg-white text-slate-600 ring-slate-200 hover:bg-slate-50',
                    )}
                  >
                    <Icon className="size-3.5" aria-hidden />
                    {t.label}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {view === 'calendar' ? (
          <div className="mt-4">
            {showAvailability && <AvailabilityEditor initialSlots={availabilityQuery.data} />}
            {appointmentsQuery.isError ? (
              <div className="mt-4 flex items-center justify-between rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-600">
                Could not load your appointments.
                <button
                  type="button"
                  onClick={() => appointmentsQuery.refetch()}
                  className="font-semibold hover:underline"
                >
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
                emptyText={
                  tab === 'upcoming' ? 'No upcoming appointments.' : 'No history records yet.'
                }
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
    </div>
  );
}
