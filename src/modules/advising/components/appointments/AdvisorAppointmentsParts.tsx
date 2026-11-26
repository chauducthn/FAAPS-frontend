// DataTable column definitions and header/KPI section for AdvisorAppointments.

import { CalendarBlank as CalendarDays, Clock as Clock3 } from '@phosphor-icons/react';
import type { DataTableColumnDef } from '../../../../shared/components/common/DataTable';
import { BookingStatusBadge } from '../../../appointment/components/AppointmentBits';
import { formatIsoDay, formatIsoTime } from '../../../../shared/lib/appointmentDate';
import type { AdvisorAppointment } from '../../../appointment/types/appointment';
import { cn } from '@/shared/lib/utils';

function initialsOf(name: string | null | undefined) {
  return (name ?? '')
    .split(' ')
    .filter(Boolean)
    .slice(-2)
    .map((part) => part[0]?.toUpperCase())
    .join('');
}

export function buildAdvisorAppointmentColumns(
  onSelect: (appointment: AdvisorAppointment) => void,
): DataTableColumnDef<AdvisorAppointment>[] {
  return [
    {
      accessorKey: 'studentName',
      header: 'Student',
      cell: ({ row }) => {
        const a = row.original;
        return (
          <div className="flex min-w-0 items-center gap-3">
            <span
              aria-hidden
              className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-[var(--brand)] text-[13px] font-bold text-white shadow-sm"
            >
              {initialsOf(a.studentName)}
            </span>
            <div className="min-w-0">
              <button
                type="button"
                onClick={() => onSelect(a)}
                className="block max-w-full truncate text-left text-[15px] font-bold text-slate-900 hover:text-[#F26F21] hover:underline"
              >
                {a.studentName ?? '—'}
              </button>
              <p className="mt-0.5 truncate text-sm font-medium text-slate-600">
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
            <p className="flex items-center gap-1.5 text-sm font-bold text-slate-900">
              <CalendarDays className="size-3.5 text-[#F26F21]" aria-hidden />
              {formatIsoDay(a.startTime)}
            </p>
            <p className="mt-1 flex items-center gap-1.5 text-sm font-medium text-slate-600">
              <Clock3 className="size-3.5 text-slate-500" aria-hidden />
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
        <p className="max-w-64 truncate text-sm font-medium text-slate-700" title={row.original.reason ?? undefined}>
          {row.original.reason ?? '—'}
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
            onClick={() => onSelect(row.original)}
            className="inline-flex h-11 items-center rounded-xl bg-[#F26F21] px-4 text-sm font-bold text-white shadow-sm transition-colors hover:bg-[#d95f14]"
          >
            Details
          </button>
        </div>
      ),
    },
  ];
}

interface AdvisorAppointmentsHeroProps {
  view: 'calendar' | 'list';
  stats: { total: number; upcoming: number; pending: number; completed: number };
  onToggleView: () => void;
}

export function AdvisorAppointmentsHero({ view, stats, onToggleView }: AdvisorAppointmentsHeroProps) {
  const kpis = [
    { label: 'Total', sub: 'all appointments', value: String(stats.total), iconBox: 'bg-slate-900 text-white shadow-[0_6px_16px_-6px_rgba(15,23,42,0.5)]', topBar: 'bg-slate-900' },
    { label: 'Upcoming', sub: 'scheduled ahead', value: String(stats.upcoming), iconBox: 'bg-[#F26F21] text-white shadow-[0_6px_16px_-6px_rgba(242,111,33,0.6)]', topBar: 'bg-[#F26F21]' },
    { label: 'Pending', sub: 'needs response', value: String(stats.pending), iconBox: 'bg-slate-100 text-slate-700 ring-1 ring-inset ring-slate-200', topBar: 'bg-slate-300' },
    { label: 'Completed', sub: 'done', value: String(stats.completed), iconBox: 'bg-emerald-600 text-white shadow-[0_6px_16px_-6px_rgba(5,150,105,0.5)]', topBar: 'bg-emerald-600' },
  ];

  return (
    <>
      <div className="relative overflow-hidden rounded-2xl bg-[var(--brand)] px-6 py-7 text-white shadow-lg shadow-orange-500/20 sm:px-8 sm:py-8">
        <div aria-hidden className="pointer-events-none absolute -right-14 -top-20 size-64 rounded-full bg-white/15 blur-[1px]" />
        <div aria-hidden className="pointer-events-none absolute -bottom-24 right-48 size-40 rounded-full bg-white/10" />
        <div aria-hidden className="pointer-events-none absolute inset-x-0 bottom-0 h-px bg-white/30" />
        <div className="relative flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="flex items-center gap-2.5 text-[26px] font-extrabold leading-tight tracking-tight text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.15)]">
              <CalendarDays className="size-7" aria-hidden />
              My Appointments
            </h1>
            <p className="mt-2 max-w-xl text-sm font-medium leading-relaxed text-white/95">
              {stats.pending > 0
                ? `${stats.pending} pending request${stats.pending === 1 ? '' : 's'} need your response.`
                : 'No pending requests right now. Nice work!'}
            </p>
          </div>
          <button
            type="button"
            onClick={onToggleView}
            className="inline-flex h-11 shrink-0 items-center justify-center gap-1.5 rounded-xl bg-white px-5 text-sm font-extrabold text-[#c2410c] shadow-[0_4px_14px_rgba(0,0,0,0.18)] transition-all hover:bg-orange-50 active:scale-[0.98]"
          >
            {view === 'calendar' ? 'Switch to List' : 'Switch to Calendar'}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-5 lg:grid-cols-4">
        {kpis.map((s) => (
          <div
            key={s.label}
            aria-readonly="true"
            className="relative cursor-default overflow-hidden rounded-2xl border border-slate-200 bg-white p-6 shadow-[0_1px_2px_rgba(15,23,42,0.06),0_10px_28px_-14px_rgba(15,23,42,0.25)]"
          >
            <span aria-hidden className={cn('absolute inset-x-0 top-0 h-1', s.topBar)} />
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="text-xs font-bold uppercase tracking-[0.08em] text-slate-500">{s.label}</p>
                <p className="mt-2.5 text-[30px] font-extrabold leading-none tabular-nums text-slate-900">{s.value}</p>
                <p className="mt-2 text-sm font-medium text-slate-600">{s.sub}</p>
              </div>
              <span className={cn('flex size-11 shrink-0 items-center justify-center rounded-xl', s.iconBox)}>
                <CalendarDays className="size-5" aria-hidden />
              </span>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
