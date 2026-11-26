// Hero, KPI cards, and quick links for AdvisorPortal.

import { Link } from 'react-router';
import {
  ArrowRight,
  BookOpen,
  CalendarBlank as CalendarDays,
  CheckCircle as CircleCheckBig,
  Hourglass,
  Tray as Inbox,
  UsersThree as UsersRound,
} from '@phosphor-icons/react';
import { cn } from '@/shared/lib/utils';

function greeting() {
  const h = new Date().getHours();
  if (h < 11) return 'Good morning';
  if (h < 14) return 'Good noon';
  if (h < 18) return 'Good afternoon';
  return 'Good evening';
}

interface AdvisorPortalHeaderProps {
  advisorName: string;
  totalStudents: number;
  atRiskCount: number;
  pendingCount: number;
  studentsLoading: boolean;
  pendingLoading: boolean;
  inProgressLoading: boolean;
  resolvedLoading: boolean;
  pendingTotal?: number;
  inProgressTotal?: number;
  resolvedTotal?: number;
}

export function AdvisorPortalHeader({
  advisorName,
  totalStudents,
  atRiskCount,
  pendingCount,
  studentsLoading,
  pendingLoading,
  inProgressLoading,
  resolvedLoading,
  pendingTotal,
  inProgressTotal,
  resolvedTotal,
}: AdvisorPortalHeaderProps) {
  const stats = [
    {
      label: 'Assigned Students',
      value: studentsLoading ? '–' : String(totalStudents),
      sub: `${atRiskCount} at risk`,
      icon: UsersRound,
      iconBox: 'bg-slate-900 text-white shadow-[0_6px_16px_-6px_rgba(15,23,42,0.5)]',
      topBar: 'bg-slate-900',
    },
    {
      label: 'Pending',
      value: pendingLoading ? '–' : String(pendingTotal ?? '–'),
      sub: 'needs response',
      icon: Inbox,
      iconBox: 'bg-[#F26F21] text-white shadow-[0_6px_16px_-6px_rgba(242,111,33,0.6)]',
      topBar: 'bg-[#F26F21]',
    },
    {
      label: 'In Progress',
      value: inProgressLoading ? '–' : String(inProgressTotal ?? '–'),
      sub: 'being handled',
      icon: Hourglass,
      iconBox: 'bg-slate-100 text-slate-700 ring-1 ring-inset ring-slate-200',
      topBar: 'bg-slate-300',
    },
    {
      label: 'Resolved',
      value: resolvedLoading ? '–' : String(resolvedTotal ?? '–'),
      sub: 'completed',
      icon: CircleCheckBig,
      iconBox: 'bg-emerald-600 text-white shadow-[0_6px_16px_-6px_rgba(5,150,105,0.5)]',
      topBar: 'bg-emerald-600',
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
            <h1 className="text-[26px] font-extrabold leading-tight tracking-tight text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.15)]">
              {greeting()}, {advisorName}
            </h1>
            <p className="mt-2 max-w-xl text-sm font-medium leading-relaxed text-white/95">
              {pendingCount > 0
                ? `${pendingCount} pending request${pendingCount === 1 ? '' : 's'} need your response today.`
                : 'No pending requests right now. Nice work!'}
            </p>
          </div>
          <Link
            to="/advisor/advising-requests"
            className="inline-flex h-11 shrink-0 items-center justify-center gap-1.5 rounded-xl bg-white px-5 text-sm font-extrabold text-[#c2410c] shadow-[0_4px_14px_rgba(0,0,0,0.18)] transition-all hover:bg-orange-50 hover:shadow-[0_6px_20px_rgba(0,0,0,0.22)] active:scale-[0.98]"
          >
            Review requests <ArrowRight className="size-4" aria-hidden />
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-5 lg:grid-cols-4">
        {stats.map((s) => (
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
                <s.icon className="size-5" aria-hidden />
              </span>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}

export function AdvisorQuickLinks({ totalStudents, atRiskCount }: { totalStudents: number; atRiskCount: number }) {
  const links = [
    { to: '/advisor/students', icon: UsersRound, title: 'My Students', desc: `${totalStudents} assigned · ${atRiskCount} at risk` },
    { to: '/advisor/appointments', icon: CalendarDays, title: 'Appointments', desc: 'Calendar & list views' },
    { to: '/advisor/academic-lookup', icon: BookOpen, title: 'Academic Search', desc: 'Curricula & courses' },
  ];

  return (
    <div className="grid gap-5 sm:grid-cols-3">
      {links.map((l) => (
        <Link
          key={l.to}
          to={l.to}
          className="group flex min-h-[80px] items-center gap-3.5 rounded-2xl border border-slate-200 bg-white p-5 shadow-[0_1px_2px_rgba(15,23,42,0.06),0_8px_24px_-14px_rgba(15,23,42,0.22)] transition-all hover:-translate-y-[1px] hover:border-[#F26F21]/50 hover:shadow-[0_2px_4px_rgba(15,23,42,0.06),0_14px_32px_-12px_rgba(242,111,33,0.35)]"
        >
          <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-[var(--brand)] text-white shadow-[0_6px_16px_-6px_rgba(242,111,33,0.7)]">
            <l.icon className="size-5" aria-hidden />
          </span>
          <span className="min-w-0 flex-1">
            <span className="block text-[15px] font-extrabold text-slate-900 group-hover:text-[#c2410c]">
              {l.title}
            </span>
            <span className="mt-0.5 block truncate text-sm font-medium text-slate-600">{l.desc}</span>
          </span>
          <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-slate-100 text-slate-500 transition-colors group-hover:bg-[#fff3ea] group-hover:text-[#F26F21]">
            <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" aria-hidden />
          </span>
        </Link>
      ))}
    </div>
  );
}
