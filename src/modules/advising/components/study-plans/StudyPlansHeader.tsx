// Hero banner, KPI cards, and status filter bar for AdvisorStudyPlans.

import { Link } from 'react-router';
import { ArrowRight, BookOpenCheck, CircleCheckBig, FileEdit, Inbox, Search } from 'lucide-react';
import { cn } from '@/shared/lib/utils';

export type StudyPlanStatusFilter = 'SUBMITTED' | 'APPROVED' | 'NEEDS_REVISION';

const TABS: { key: StudyPlanStatusFilter; label: string; icon: typeof Inbox }[] = [
  { key: 'SUBMITTED', label: 'Submitted', icon: Inbox },
  { key: 'APPROVED', label: 'Approved', icon: CircleCheckBig },
  { key: 'NEEDS_REVISION', label: 'Needs revision', icon: FileEdit },
];

interface StudyPlansCounts {
  total: number;
  submitted: number;
  approved: number;
  needsRevision: number;
}

export function StudyPlansHeader({
  counts,
  countsLoading,
  countsFailed,
}: {
  counts: StudyPlansCounts | null;
  countsLoading: boolean;
  countsFailed: boolean;
}) {
  const countValue = (value: number | undefined) =>
    countsLoading ? null : countsFailed ? '–' : String(value ?? 0);

  const kpis = [
    { label: 'Total plans', value: countValue(counts?.total), sub: 'all semesters', icon: BookOpenCheck, iconBox: 'bg-slate-900 text-white shadow-[0_6px_16px_-6px_rgba(15,23,42,0.5)]', topBar: 'bg-slate-900' },
    { label: 'Submitted', value: countValue(counts?.submitted), sub: 'needs review', icon: Inbox, iconBox: 'bg-[#F26F21] text-white shadow-[0_6px_16px_-6px_rgba(242,111,33,0.6)]', topBar: 'bg-[#F26F21]' },
    { label: 'Approved', value: countValue(counts?.approved), sub: 'ready to go', icon: CircleCheckBig, iconBox: 'bg-emerald-600 text-white shadow-[0_6px_16px_-6px_rgba(5,150,105,0.5)]', topBar: 'bg-emerald-600' },
    { label: 'Needs revision', value: countValue(counts?.needsRevision), sub: 'waiting on student', icon: FileEdit, iconBox: 'bg-slate-100 text-slate-700 ring-1 ring-inset ring-slate-200', topBar: 'bg-slate-300' },
  ];

  return (
    <>
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#b45309] via-[#F26F21] to-[#fb923c] px-6 py-7 text-white shadow-lg shadow-orange-500/20 sm:px-8 sm:py-8">
        <div aria-hidden className="pointer-events-none absolute -right-14 -top-20 size-64 rounded-full bg-white/15 blur-[1px]" />
        <div aria-hidden className="pointer-events-none absolute -bottom-24 right-48 size-40 rounded-full bg-white/10" />
        <div aria-hidden className="pointer-events-none absolute inset-x-0 bottom-0 h-px bg-white/30" />
        <div className="relative flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="flex items-center gap-2.5 text-[26px] font-extrabold leading-tight tracking-tight text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.15)]">
              <BookOpenCheck className="size-7" aria-hidden strokeWidth={2.25} />
              Study Plan Reviews
            </h1>
            <p className="mt-2 max-w-xl text-sm font-medium leading-relaxed text-white/95">
              {countsLoading
                ? 'Loading the plans that need your review…'
                : countsFailed
                  ? 'Could not load the review counts right now.'
                  : (counts?.submitted ?? 0) > 0
                    ? `${counts?.submitted} plan${counts?.submitted === 1 ? '' : 's'} waiting for your review.`
                    : 'No plans waiting for review right now. Nice work!'}
            </p>
          </div>
          <Link
            to="/advisor"
            className="inline-flex h-11 shrink-0 items-center justify-center gap-1.5 rounded-xl bg-white px-5 text-sm font-extrabold text-[#c2410c] shadow-[0_4px_14px_rgba(0,0,0,0.18)] transition-all hover:bg-orange-50 active:scale-[0.98]"
          >
            Back to Overview <ArrowRight className="size-4" aria-hidden />
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
                {s.value === null ? (
                  <span aria-hidden className="mt-3 block h-7 w-20 animate-pulse rounded-lg bg-slate-200" />
                ) : (
                  <p className="mt-2.5 text-[30px] font-extrabold leading-none tabular-nums text-slate-900">{s.value}</p>
                )}
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

export function StudyPlanFilterBar({
  status,
  search,
  onStatusChange,
  onSearchChange,
}: {
  status: StudyPlanStatusFilter;
  search: string;
  onStatusChange: (status: StudyPlanStatusFilter) => void;
  onSearchChange: (search: string) => void;
}) {
  return (
    <>
      <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h2 className="text-lg font-bold tracking-tight text-slate-900">Plans awaiting you</h2>
          <p className="mt-1.5 text-sm font-medium leading-relaxed text-slate-600">
            Filter by status, then open a plan to approve, reject, or request changes.
          </p>
        </div>
        <label className="flex h-11 w-full items-center gap-2 rounded-xl border border-slate-200 bg-white px-3.5 transition-colors focus-within:border-[#F26F21] focus-within:ring-2 focus-within:ring-[#F26F21]/30 lg:w-72">
          <Search className="size-4 shrink-0 text-slate-500" aria-hidden />
          <input
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search student, code, semester..."
            aria-label="Search study plans"
            className="flex-1 bg-transparent text-sm font-medium text-slate-900 outline-none placeholder:font-normal placeholder:text-slate-500"
          />
        </label>
      </div>

      <div className="mt-5 flex flex-wrap gap-2" role="tablist" aria-label="Filter plans by status">
        {TABS.map((t) => {
          const activeTab = status === t.key;
          const Icon = t.icon;
          return (
            <button
              key={t.key}
              type="button"
              role="tab"
              aria-selected={activeTab}
              onClick={() => onStatusChange(t.key)}
              className={cn(
                'inline-flex h-11 items-center gap-1.5 rounded-full px-5 text-sm font-bold ring-1 ring-inset transition-colors',
                activeTab
                  ? 'bg-[#F26F21] text-white ring-[#F26F21] shadow-sm'
                  : 'bg-white text-slate-700 ring-slate-200 hover:bg-[#fff7f0] hover:text-slate-900',
              )}
            >
              <Icon className="size-3.5" aria-hidden />
              {t.label}
            </button>
          );
        })}
      </div>
    </>
  );
}
