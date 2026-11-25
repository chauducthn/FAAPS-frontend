// Hero banner, KPI cards, and quick-filter status chips for AdvisorStudents.

import { Link } from 'react-router';
import { GraduationCap, TriangleAlert, UserCheck, UsersRound } from 'lucide-react';
import { cn } from '@/shared/lib/utils';
import type { AcademicStatus } from '../../types/advising';

export const STUDENT_STATUS_OPTIONS: { value: 'ALL' | AcademicStatus; label: string }[] = [
  { value: 'ALL', label: 'Status: All' },
  { value: 'ACTIVE', label: 'Status: Active' },
  { value: 'PROBATION', label: 'Status: Probation' },
  { value: 'SUSPENDED', label: 'Status: Suspended' },
  { value: 'GRADUATED', label: 'Status: Graduated' },
  { value: 'WITHDRAWN', label: 'Status: Withdrawn' },
  { value: 'LEAVE_OF_ABSENCE', label: 'Status: Leave of absence' },
];

interface AdvisorStudentsStats {
  total: number;
  active: number;
  atRisk: number;
  avgGpa: number | null;
}

export function AdvisorStudentsHeader({ stats }: { stats: AdvisorStudentsStats }) {
  const kpis = [
    { icon: UsersRound, label: 'Assigned', sub: 'total students', value: String(stats.total), iconBox: 'bg-slate-900 text-white shadow-[0_6px_16px_-6px_rgba(15,23,42,0.5)]', topBar: 'bg-slate-900' },
    { icon: UserCheck, label: 'Active', sub: 'studying normally', value: String(stats.active), iconBox: 'bg-emerald-600 text-white shadow-[0_6px_16px_-6px_rgba(5,150,105,0.5)]', topBar: 'bg-emerald-600' },
    { icon: TriangleAlert, label: 'At risk', sub: 'probation/suspended', value: String(stats.atRisk), iconBox: 'bg-[#F26F21] text-white shadow-[0_6px_16px_-6px_rgba(242,111,33,0.6)]', topBar: 'bg-[#F26F21]' },
    {
      icon: GraduationCap,
      label: 'Avg GPA',
      sub: 'cohort average',
      value: stats.avgGpa !== null ? stats.avgGpa.toFixed(2) : '—',
      iconBox: 'bg-slate-100 text-slate-700 ring-1 ring-inset ring-slate-200',
      topBar: 'bg-slate-300',
    },
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
              <UsersRound className="size-7" aria-hidden strokeWidth={2.25} />
              My Students
            </h1>
            <p className="mt-2 max-w-xl text-sm font-medium leading-relaxed text-white/95">
              {stats.total > 0
                ? `${stats.total} assigned · ${stats.atRisk} need attention${stats.avgGpa !== null ? ` · Avg GPA ${stats.avgGpa.toFixed(2)}` : ''}`
                : 'No students assigned yet.'}
            </p>
          </div>
          <Link
            to="/advisor"
            className="inline-flex h-11 shrink-0 items-center justify-center gap-1.5 rounded-xl bg-white px-5 text-sm font-extrabold text-[#c2410c] shadow-[0_4px_14px_rgba(0,0,0,0.18)] transition-all hover:bg-orange-50 active:scale-[0.98]"
          >
            Back to Overview
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-5 lg:grid-cols-4">
        {kpis.map((s) => (
          <div key={s.label} aria-readonly="true" className="relative cursor-default overflow-hidden rounded-2xl border border-slate-200 bg-white p-6 shadow-[0_1px_2px_rgba(15,23,42,0.06),0_10px_28px_-14px_rgba(15,23,42,0.25)]">
            <span aria-hidden className={cn('absolute inset-x-0 top-0 h-1', s.topBar)} />
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="text-xs font-bold uppercase tracking-[0.08em] text-slate-500">{s.label}</p>
                <p className="mt-2.5 text-[30px] font-extrabold leading-none tabular-nums text-slate-900">{s.value}</p>
                <p className="mt-2 text-sm font-medium text-slate-600">{s.sub}</p>
              </div>
              <span className={cn('flex size-11 shrink-0 items-center justify-center rounded-xl', s.iconBox)}>
                <s.icon className="size-5" aria-hidden strokeWidth={2.25} />
              </span>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}

export function StudentQuickFilterChips({
  chips,
  status,
  onSelect,
}: {
  chips: { value: 'ALL' | AcademicStatus; label: string; count: number }[];
  status: 'ALL' | AcademicStatus;
  onSelect: (value: 'ALL' | AcademicStatus) => void;
}) {
  return (
    <div className="mb-4 flex flex-wrap items-center gap-3" role="group" aria-label="Quick filter by status">
      {chips.map((chip) => {
        const active = status === chip.value;
        return (
          <button
            key={chip.value}
            type="button"
            onClick={() => onSelect(chip.value)}
            aria-pressed={active}
            className={cn(
              'inline-flex h-11 items-center gap-1.5 rounded-full px-4 text-sm font-bold ring-1 ring-inset transition-colors',
              active
                ? 'bg-[#F26F21] text-white ring-[#F26F21] shadow-sm'
                : 'bg-white text-slate-700 ring-slate-200 hover:bg-[#fff7f0] hover:text-slate-900',
            )}
          >
            {chip.label}
            <span className={cn('rounded-full px-1.5 py-px text-xs font-bold tabular-nums', active ? 'bg-white/25 text-white' : 'bg-slate-100 text-slate-600')}>
              {chip.count}
            </span>
          </button>
        );
      })}
    </div>
  );
}
