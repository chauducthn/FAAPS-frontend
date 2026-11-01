// src/pages/advising/AdvisorAdvisingRequests.tsx
// Trang "Yêu cầu tư vấn" — đồng bộ Overview mới:
// Hero cam đậm + nút trắng + 4 KPI trắng viền top-bar + section trắng p-6 sm:p-8.

import { useMemo, useState } from 'react';
import { ArrowRight, CircleCheckBig, ClipboardList, Hourglass, Inbox, Search, UsersRound } from 'lucide-react';
import { Link } from 'react-router';
import { RequestListTable } from '../components/RequestListTable';
import { useAdvisorAdvisingRequests } from '../hooks/queries/useAdvisorQueries';
import { cn } from '@/shared/lib/utils';

export default function AdvisorAdvisingRequests() {
  const [search, setSearch] = useState('');
  const { data } = useAdvisorAdvisingRequests({});

  const stats = useMemo(() => {
    const all = data ?? [];
    return {
      total: all.length,
      pending: all.filter((r) => r.status === 'PENDING').length,
      inProgress: all.filter((r) => r.status === 'IN_PROGRESS').length,
      resolved: all.filter((r) => r.status === 'RESOLVED').length,
    };
  }, [data]);

  const kpis = [
    { label: 'Total', value: String(stats.total), sub: 'all requests', icon: UsersRound, iconBox: 'bg-slate-900 text-white shadow-[0_6px_16px_-6px_rgba(15,23,42,0.5)]', topBar: 'bg-slate-900' },
    { label: 'Pending', value: String(stats.pending), sub: 'needs response', icon: Inbox, iconBox: 'bg-[#F26F21] text-white shadow-[0_6px_16px_-6px_rgba(242,111,33,0.6)]', topBar: 'bg-[#F26F21]' },
    { label: 'In progress', value: String(stats.inProgress), sub: 'being handled', icon: Hourglass, iconBox: 'bg-slate-100 text-slate-700 ring-1 ring-inset ring-slate-200', topBar: 'bg-slate-300' },
    { label: 'Resolved', value: String(stats.resolved), sub: 'completed', icon: CircleCheckBig, iconBox: 'bg-emerald-600 text-white shadow-[0_6px_16px_-6px_rgba(5,150,105,0.5)]', topBar: 'bg-emerald-600' },
  ];

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-10 pb-4">
      {/* Hero — đồng bộ Overview */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#b45309] via-[#F26F21] to-[#fb923c] px-6 py-7 text-white shadow-lg shadow-orange-500/20 sm:px-8 sm:py-8">
        <div aria-hidden className="pointer-events-none absolute -right-14 -top-20 size-64 rounded-full bg-white/15 blur-[1px]" />
        <div aria-hidden className="pointer-events-none absolute -bottom-24 right-48 size-40 rounded-full bg-white/10" />
        <div aria-hidden className="pointer-events-none absolute inset-x-0 bottom-0 h-px bg-white/30" />
        <div className="relative flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="flex items-center gap-2.5 text-[26px] font-extrabold leading-tight tracking-tight text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.15)]">
              <ClipboardList className="size-7" aria-hidden strokeWidth={2.25} />
              Advising Requests
            </h1>
            <p className="mt-2 max-w-xl text-sm font-medium leading-relaxed text-white/95">
              {stats.pending > 0
                ? `${stats.pending} pending request${stats.pending === 1 ? '' : 's'} need your response.`
                : 'No pending requests right now. Nice work!'}
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

      {/* KPI read-only — giống Overview */}
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
                <s.icon className="size-5" aria-hidden strokeWidth={2.25} />
              </span>
            </div>
          </div>
        ))}
      </div>

      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
        <div className="flex flex-wrap items-center gap-3">
          <label className="flex h-11 w-full max-w-md items-center gap-2 rounded-xl border border-slate-200 bg-white px-3.5 transition-colors focus-within:border-[#F26F21] focus-within:ring-2 focus-within:ring-[#F26F21]/30">
            <Search className="size-4 shrink-0 text-slate-500" aria-hidden />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by student name, student ID, or title..."
              aria-label="Search requests"
              className="flex-1 bg-transparent text-sm font-medium text-slate-900 outline-none placeholder:font-normal placeholder:text-slate-500"
            />
          </label>
          {search.trim() !== '' && (
            <button
              type="button"
              onClick={() => setSearch('')}
              className="inline-flex h-11 items-center rounded-xl px-4 text-sm font-bold text-slate-600 transition-colors hover:bg-slate-100"
            >
              Clear search
            </button>
          )}
        </div>

        <div className="mt-6">
          <RequestListTable search={search.trim()} />
        </div>
      </section>
    </div>
  );
}
