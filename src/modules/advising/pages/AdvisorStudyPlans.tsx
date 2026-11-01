// src/pages/advising/AdvisorStudyPlans.tsx
// "Study Plan Reviews" — redesigned into the Overview design system:
// FPT-orange hero + read-only KPI cards + tab-filtered review workspace.
// Business rules preserved: filter by status, plan detail (courses, credits,
// validation warnings), decisions Approve / Reject / Needs Revision + comment.

import { useMemo, useState } from 'react';
import { Link } from 'react-router';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  ArrowRight,
  BookOpenCheck,
  CalendarDays,
  CircleCheckBig,
  CircleX,
  Check,
  Clock3,
  FileEdit,
  GraduationCap,
  Inbox,
  Search,
  ShieldAlert,
  TriangleAlert,
  X,
} from 'lucide-react';
import { Modal } from '../../../shared/components/ui/Modal';
import { apiMessage } from '../../../shared/lib/apiMessage';
import { advisorStudyPlanService } from '../services/advisorStudyPlanService';
import { advisorService } from '../services/advisorService';
import { courseByCode } from '../../../mocks/academicLookupMock';
import type { StudyPlanDecision } from '../types/study-plan';
import { cn } from '@/shared/lib/utils';

// Fallback context for senior SE courses (not in the lookup mock yet).
const COURSE_FALLBACK: Record<string, { category: string; description: string; prerequisites: { code: string; name: string }[] }> = {
  SE401: {
    category: 'Core',
    description: 'Kiến trúc phần mềm: styles, patterns, đánh giá trade-off và tài liệu hoá kiến trúc.',
    prerequisites: [{ code: 'SE301', name: 'Software Engineering' }],
  },
  SE402: {
    category: 'Core',
    description: 'Hệ phân tán: RPC, consensus cơ bản, replication và xử lý lỗi mạng.',
    prerequisites: [
      { code: 'SE301', name: 'Software Engineering' },
      { code: 'DBI202', name: 'Database Systems' },
    ],
  },
  SE403: {
    category: 'Elective',
    description: 'Học máy ứng dụng: pipeline dữ liệu, huấn luyện và đánh giá mô hình.',
    prerequisites: [
      { code: 'DSA204', name: 'Data Structures and Algorithms' },
      { code: 'MAE101', name: 'Mathematics for Engineering' },
    ],
  },
  SE405: {
    category: 'Elective',
    description: 'Điện toán đám mây: ảo hoá, container, triển khai và giám sát dịch vụ.',
    prerequisites: [{ code: 'SE301', name: 'Software Engineering' }],
  },
};

function creditLoadLabel(total: number) {
  if (total < 14) return { label: 'Light load', className: 'bg-slate-100 text-slate-800 ring-slate-300' };
  if (total <= 20) return { label: 'Normal load', className: 'bg-emerald-100 text-emerald-950 ring-emerald-300' };
  return { label: 'Heavy load', className: 'bg-red-100 text-red-950 ring-red-300' };
}

type StatusFilter = 'SUBMITTED' | 'APPROVED' | 'REJECTED' | 'NEEDS_REVISION' | 'ALL';

const TABS: { key: StatusFilter; label: string; icon: typeof Inbox }[] = [
  { key: 'SUBMITTED', label: 'Submitted', icon: Inbox },
  { key: 'APPROVED', label: 'Approved', icon: CircleCheckBig },
  { key: 'NEEDS_REVISION', label: 'Needs revision', icon: FileEdit },
  { key: 'REJECTED', label: 'Rejected', icon: CircleX },
  { key: 'ALL', label: 'All', icon: BookOpenCheck },
];

const STATUS_BADGE: Record<string, string> = {
  SUBMITTED: 'bg-orange-100 text-orange-950 ring-orange-300',
  APPROVED: 'bg-emerald-100 text-emerald-950 ring-emerald-300',
  REJECTED: 'bg-red-100 text-red-950 ring-red-300',
  NEEDS_REVISION: 'bg-amber-100 text-amber-950 ring-amber-300',
};

const DECISIONS: { key: StudyPlanDecision; label: string; hint: string; active: string }[] = [
  {
    key: 'APPROVED',
    label: 'Approve',
    hint: 'Plan meets all requirements',
    active: 'border-emerald-500 bg-emerald-50 text-emerald-950 ring-emerald-200',
  },
  {
    key: 'NEEDS_REVISION',
    label: 'Needs revision',
    hint: 'Ask the student to fix & resubmit',
    active: 'border-amber-500 bg-amber-50 text-amber-950 ring-amber-200',
  },
  {
    key: 'REJECTED',
    label: 'Reject',
    hint: 'Plan cannot be accepted',
    active: 'border-red-500 bg-red-50 text-red-950 ring-red-200',
  },
];

function initialsOf(name: string) {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(-2)
    .map((part) => part[0]?.toUpperCase())
    .join('');
}

function formatStamp(iso: string | null) {
  if (!iso) return '—';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
}

export default function AdvisorStudyPlans() {
  const qc = useQueryClient();
  const [status, setStatus] = useState<StatusFilter>('SUBMITTED');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(0);
  const [selectedId, setSelectedId] = useState('');
  const [decision, setDecision] = useState<StudyPlanDecision>('APPROVED');
  const [comment, setComment] = useState('');
  const [message, setMessage] = useState('');

  const plans = useQuery({
    queryKey: ['advisor', 'study-plans', status, page],
    queryFn: () => advisorStudyPlanService.list(status, page, 20),
  });
  const countsQuery = useQuery({
    queryKey: ['advisor', 'study-plans', 'ALL', 0],
    queryFn: () => advisorStudyPlanService.list('ALL', 0, 100),
  });
  const detail = useQuery({
    queryKey: ['advisor', 'study-plan', selectedId],
    queryFn: () => advisorStudyPlanService.detail(selectedId),
    enabled: Boolean(selectedId),
  });
  const selectedStudentId = detail.data?.studentId ?? '';
  const studentDetail = useQuery({
    queryKey: ['advisor', 'student-detail', selectedStudentId],
    queryFn: () => advisorService.getStudentDetail(selectedStudentId),
    enabled: Boolean(selectedStudentId),
  });

  const counts = useMemo(() => {
    const items = countsQuery.data?.items ?? [];
    return {
      total: items.length,
      submitted: items.filter((p) => p.status === 'SUBMITTED').length,
      approved: items.filter((p) => p.status === 'APPROVED').length,
      revision: items.filter((p) => p.status === 'NEEDS_REVISION').length,
    };
  }, [countsQuery.data]);

  // Enriched context for the review modal: who the student is + what they passed.
  const student = studentDetail.data?.profile ?? null;
  const progress = studentDetail.data?.progress ?? null;
  const transcript = useMemo(() => studentDetail.data?.transcript ?? [], [studentDetail.data]);
  // Transcript uses legacy SE*** codes while the course catalog uses PRF192/DBI202/... —
  // treat known equivalents as passed so the prereq check is fair.
  const CODE_EQUIV: Record<string, string[]> = {
    SE101: ['PRF192'],
    SE104: ['DSA204'],
    SE203: ['DBI202'],
    SE301: ['SWE201', 'SE301'],
  };
  const passedByCode = useMemo(() => {
    const map = new Map<string, number | null>();
    for (const row of transcript) {
      const done = row.status === 'COMPLETED' || row.creditsEarned > 0;
      if (!done) continue;
      if (!map.has(row.courseCode)) map.set(row.courseCode, row.finalScore);
      for (const alias of CODE_EQUIV[row.courseCode] ?? []) {
        if (!map.has(alias)) map.set(alias, row.finalScore);
      }
    }
    return map;
  }, [transcript]);
  const gpaTone =
    student?.currentGpa == null
      ? 'text-slate-600'
      : student.currentGpa >= 8
        ? 'text-emerald-700'
        : student.currentGpa >= 6.5
          ? 'text-orange-900'
          : 'text-red-700';

  const review = useMutation({
    mutationFn: () => advisorStudyPlanService.decide(selectedId, decision, comment.trim()),
    onSuccess: async () => {
      setMessage('Study plan reviewed successfully.');
      setSelectedId('');
      setComment('');
      setDecision('APPROVED');
      await qc.invalidateQueries({ queryKey: ['advisor', 'study-plans'] });
    },
    onError: (error) => setMessage(apiMessage(error)),
  });

  const submit = () => {
    if (decision !== 'APPROVED' && !comment.trim()) {
      setMessage('A comment is required for rejection or revision requests.');
      return;
    }
    setMessage('');
    review.mutate();
  };

  const switchStatus = (next: StatusFilter) => {
    setStatus(next);
    setPage(0);
  };

  const openReview = (id: string) => {
    setSelectedId(id);
    setDecision('APPROVED');
    setComment('');
    setMessage('');
  };

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    const items = plans.data?.items ?? [];
    if (!q) return items;
    return items.filter(
      (p) =>
        p.studentName.toLowerCase().includes(q) ||
        p.studentCode.toLowerCase().includes(q) ||
        p.semesterCode.toLowerCase().includes(q),
    );
  }, [plans.data, search]);

  const kpis = [
    { label: 'Total plans', value: countsQuery.isLoading ? '–' : String(counts.total), sub: 'all semesters', icon: BookOpenCheck, iconBox: 'bg-slate-900 text-white shadow-[0_6px_16px_-6px_rgba(15,23,42,0.5)]', topBar: 'bg-slate-900' },
    { label: 'Submitted', value: countsQuery.isLoading ? '–' : String(counts.submitted), sub: 'needs review', icon: Inbox, iconBox: 'bg-[#F26F21] text-white shadow-[0_6px_16px_-6px_rgba(242,111,33,0.6)]', topBar: 'bg-[#F26F21]' },
    { label: 'Approved', value: countsQuery.isLoading ? '–' : String(counts.approved), sub: 'ready to go', icon: CircleCheckBig, iconBox: 'bg-emerald-600 text-white shadow-[0_6px_16px_-6px_rgba(5,150,105,0.5)]', topBar: 'bg-emerald-600' },
    { label: 'Needs revision', value: countsQuery.isLoading ? '–' : String(counts.revision), sub: 'waiting on student', icon: FileEdit, iconBox: 'bg-slate-100 text-slate-700 ring-1 ring-inset ring-slate-200', topBar: 'bg-slate-300' },
  ];

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-10 pb-4">
      {/* ── Hero — đồng bộ Overview ── */}
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
              {counts.submitted > 0
                ? `${counts.submitted} plan${counts.submitted === 1 ? '' : 's'} waiting for your review.`
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

      {/* ── KPI read-only — giống Overview ── */}
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

      {/* ── List section ── */}
      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
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
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search student, code, semester..."
              aria-label="Search study plans"
              className="flex-1 bg-transparent text-sm font-medium text-slate-900 outline-none placeholder:font-normal placeholder:text-slate-500"
            />
          </label>
        </div>

        {/* Status tabs */}
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
                onClick={() => switchStatus(t.key)}
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

        {message && (
          <p role="status" className="mt-4 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-700">
            {message}
          </p>
        )}

        <div className="mt-5">
          {plans.isLoading ? (
            <ul className="space-y-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <li key={i} className="flex items-center gap-3 rounded-2xl border border-slate-200 p-5">
                  <span className="size-12 shrink-0 animate-pulse rounded-xl bg-slate-100" />
                  <div className="flex-1 space-y-2">
                    <div className="h-3.5 w-1/3 animate-pulse rounded bg-slate-100" />
                    <div className="h-3 w-1/4 animate-pulse rounded bg-slate-100" />
                  </div>
                </li>
              ))}
            </ul>
          ) : plans.isError ? (
            <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-4 text-sm font-medium text-red-800">
              Could not load study plans.{' '}
              <button type="button" onClick={() => plans.refetch()} className="font-bold underline">
                Retry
              </button>
            </div>
          ) : filtered.length === 0 ? (
            <p className="rounded-xl bg-slate-50 px-4 py-10 text-center text-sm font-medium text-slate-600">
              {search.trim() ? 'No plans match your search.' : 'No study plans with this status.'}
            </p>
          ) : (
            <ul className="space-y-3">
              {filtered.map((plan) => {
                const needsAction = plan.status === 'SUBMITTED';
                return (
                  <li
                    key={plan.id}
                    className={cn(
                      'flex flex-col gap-4 rounded-2xl border bg-white p-5 transition-shadow hover:shadow-md sm:flex-row sm:items-center',
                      needsAction ? 'border-[#F26F21]/40' : 'border-slate-200',
                    )}
                  >
                    <div className="flex min-w-0 flex-1 items-center gap-3.5">
                      <span
                        aria-hidden
                        className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-[#F26F21] to-[#ff9a4d] text-sm font-extrabold text-white shadow-sm"
                      >
                        {initialsOf(plan.studentName)}
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-[15px] font-bold text-slate-900">{plan.studentName}</p>
                        <p className="mt-0.5 truncate text-sm font-medium text-slate-600">
                          {plan.studentCode} · {plan.semesterCode} · v{plan.version}
                        </p>
                        <div className="mt-2 flex flex-wrap items-center gap-2">
                          <span
                            className={cn(
                              'inline-flex h-7 items-center rounded-full px-2.5 text-xs font-bold ring-1 ring-inset',
                              STATUS_BADGE[plan.status] ?? STATUS_BADGE.SUBMITTED,
                            )}
                          >
                            {plan.status.replaceAll('_', ' ').toLowerCase().replace(/^\w/, (c) => c.toUpperCase())}
                          </span>
                          <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-slate-600">
                            <BookOpenCheck className="size-3.5 text-slate-500" aria-hidden />
                            {plan.totalCredits} credits
                          </span>
                          <span className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-500">
                            <Clock3 className="size-3.5" aria-hidden />
                            {formatStamp(plan.submittedAt)}
                          </span>
                        </div>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => openReview(plan.id)}
                      className={cn(
                        'inline-flex h-11 shrink-0 items-center justify-center rounded-xl px-5 text-sm font-bold shadow-sm transition-colors',
                        needsAction
                          ? 'bg-[#F26F21] text-white hover:bg-[#d95f14]'
                          : 'border border-slate-200 bg-white text-slate-700 hover:border-[#F26F21]/40 hover:text-[#F26F21]',
                      )}
                    >
                      {needsAction ? 'Review now' : 'View details'}
                    </button>
                  </li>
                );
              })}
            </ul>
          )}

          {plans.data && plans.data.totalPages > 1 && (
            <div className="mt-5 flex items-center justify-between rounded-xl bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-700 ring-1 ring-inset ring-slate-200">
              <button
                type="button"
                disabled={page === 0}
                onClick={() => setPage((v) => v - 1)}
                className="inline-flex h-11 items-center rounded-xl px-4 font-bold transition-colors hover:bg-white disabled:opacity-40"
              >
                Previous
              </button>
              <span className="tabular-nums">
                Page {page + 1} of {plans.data.totalPages}
              </span>
              <button
                type="button"
                disabled={page + 1 >= plans.data.totalPages}
                onClick={() => setPage((v) => v + 1)}
                className="inline-flex h-11 items-center rounded-xl px-4 font-bold transition-colors hover:bg-white disabled:opacity-40"
              >
                Next
              </button>
            </div>
          )}
        </div>
      </section>

      {/* ── Review modal ── */}
      <Modal open={Boolean(selectedId)} onClose={() => setSelectedId('')} title="Study plan review" className="max-w-3xl">
        <div className="flex items-start justify-between gap-4 border-b border-slate-200 p-6 sm:px-7">
          <div className="flex min-w-0 items-center gap-3.5">
            <span
              aria-hidden
              className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-[#F26F21] to-[#ff9a4d] text-sm font-extrabold text-white shadow-sm"
            >
              {detail.data ? initialsOf(detail.data.studentName) : '–'}
            </span>
            <div className="min-w-0">
              <h2 className="truncate text-lg font-extrabold tracking-tight text-slate-900">
                {detail.data ? `${detail.data.studentName} · ${detail.data.plan.header.semesterCode}` : 'Study plan review'}
              </h2>
              <p className="mt-0.5 text-sm font-medium text-slate-600">
                {detail.data
                  ? `${detail.data.studentCode} · v${detail.data.plan.header.version} · ${detail.data.plan.header.totalCredits} credits`
                  : 'Loading plan details...'}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setSelectedId('')}
            aria-label="Close review"
            className="flex size-11 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 shadow-sm transition-colors hover:bg-slate-50"
          >
            ✕
          </button>
        </div>

        <div className="max-h-[62vh] overflow-y-auto p-6 sm:px-7">
          {detail.isLoading ? (
            <div className="space-y-2.5">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="h-12 animate-pulse rounded-xl bg-slate-100" />
              ))}
            </div>
          ) : detail.isError || !detail.data ? (
            <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-4 text-sm font-medium text-red-800">
              Could not load this study plan.{' '}
              <button type="button" onClick={() => detail.refetch()} className="font-bold underline">
                Retry
              </button>
            </div>
          ) : (
            <div className="space-y-5">
              {/* Student snapshot — who is registering */}
              <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4 sm:p-5">
                <h3 className="flex items-center gap-1.5 text-sm font-extrabold uppercase tracking-[0.08em] text-slate-500">
                  <GraduationCap className="size-4" aria-hidden />
                  Student snapshot
                </h3>
                {studentDetail.isLoading ? (
                  <div className="mt-3 space-y-2">
                    <div className="h-4 w-2/3 animate-pulse rounded bg-slate-200/70" />
                    <div className="h-4 w-1/2 animate-pulse rounded bg-slate-200/70" />
                  </div>
                ) : student ? (
                  <div className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm">
                    <span className="font-extrabold text-slate-900">{student.fullName}</span>
                    <span className="font-medium text-slate-600">{student.studentCode} · {student.majorCode} · Sem {student.currentSemester}</span>
                    <span className={cn('text-sm font-extrabold tabular-nums', gpaTone)}>
                      GPA {student.currentGpa != null ? student.currentGpa.toFixed(2) : '—'}
                    </span>
                    <span className="font-semibold tabular-nums text-slate-700">
                      {student.totalCreditsEarned ?? 0}/132 credits
                    </span>
                    <span className="inline-flex h-7 items-center rounded-full bg-slate-900 px-2.5 text-xs font-bold text-white">
                      {student.academicStatus ?? 'ACTIVE'}
                    </span>
                  </div>
                ) : (
                  <p className="mt-3 text-sm font-medium text-slate-600">Student profile unavailable.</p>
                )}
                {progress && (
                  <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-slate-200">
                    <span
                      className="block h-full rounded-full bg-gradient-to-r from-[#F26F21] to-[#ff9a4d]"
                      style={{ width: `${Math.min(100, Math.round((progress.earnedCredits / progress.requiredCredits) * 100))}%` }}
                    />
                  </div>
                )}
              </div>

              {/* Registration context — what was submitted */}
              <div className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-5">
                <h3 className="flex items-center gap-1.5 text-sm font-extrabold uppercase tracking-[0.08em] text-slate-500">
                  <CalendarDays className="size-4" aria-hidden />
                  Registration context
                </h3>
                <div className="mt-3 grid gap-2.5 sm:grid-cols-2">
                  {[
                    { label: 'Semester', value: detail.data.plan.header.semesterCode },
                    { label: 'Version', value: `v${detail.data.plan.header.version}${detail.data.plan.header.previousPlanId ? ` (replaces ${detail.data.plan.header.previousPlanId})` : ' (first submission)'}` },
                    { label: 'Submitted', value: formatStamp(detail.data.plan.header.submittedAt) },
                    { label: 'Plan type', value: detail.data.plan.header.planType },
                  ].map((f) => (
                    <div key={f.label} className="rounded-xl bg-slate-50 px-3.5 py-2.5 ring-1 ring-inset ring-slate-200">
                      <p className="text-xs font-bold uppercase tracking-wide text-slate-500">{f.label}</p>
                      <p className="mt-0.5 truncate text-sm font-bold text-slate-900">{f.value}</p>
                    </div>
                  ))}
                </div>
                {(() => {
                  const load = creditLoadLabel(detail.data.plan.header.totalCredits);
                  return (
                    <p className="mt-3 flex flex-wrap items-center gap-2 text-sm font-bold text-slate-900">
                      <span className="tabular-nums">{detail.data.plan.header.totalCredits} credits · {detail.data.plan.courses.length} courses</span>
                      <span className={cn('inline-flex h-7 items-center rounded-full px-2.5 text-xs font-bold ring-1 ring-inset', load.className)}>
                        {load.label}
                      </span>
                    </p>
                  );
                })()}
              </div>

              {/* Courses with prerequisite check */}
              <div>
                <h3 className="text-sm font-extrabold uppercase tracking-[0.08em] text-slate-500">
                  Requested courses · {detail.data.plan.courses.length}
                </h3>
                <ul className="mt-3 space-y-3">
                  {detail.data.plan.courses.map((course) => {
                    const lookup = courseByCode(course.code);
                    const fallback = COURSE_FALLBACK[course.code];
                    const category = lookup?.category ?? fallback?.category ?? 'Core';
                    const description = lookup?.description ?? fallback?.description ?? '';
                    const prereqs = (lookup?.prerequisites ?? []).map((p) => ({ code: p.courseCode, name: p.courseName })) ??
                      [];
                    const allPrereqs = prereqs.length > 0 ? prereqs : (fallback?.prerequisites ?? []);
                    const missing = allPrereqs.filter((p) => !passedByCode.has(p.code));
                    const ok = missing.length === 0;
                    return (
                      <li key={course.id} className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
                        <div className="flex items-start gap-3 px-4 py-3.5">
                          <span
                            aria-hidden
                            className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-[#fff3ea] text-xs font-extrabold text-[#c2410c]"
                          >
                            {course.code.slice(0, 2)}
                          </span>
                          <div className="min-w-0 flex-1">
                            <p className="flex flex-wrap items-center gap-2 text-[15px] font-bold text-slate-900">
                              <span className="truncate">{course.code} · {course.name}</span>
                            </p>
                            <p className="mt-1 flex flex-wrap items-center gap-2 text-sm">
                              <span className="inline-flex h-6 items-center rounded-full bg-slate-100 px-2 text-xs font-bold text-slate-700 ring-1 ring-inset ring-slate-200">
                                {category}
                              </span>
                              <span className="inline-flex h-6 items-center rounded-full bg-slate-100 px-2 text-xs font-bold tabular-nums text-slate-700 ring-1 ring-inset ring-slate-200">
                                {course.credits} cr
                              </span>
                              {ok ? (
                                <span className="inline-flex h-6 items-center gap-1 rounded-full bg-emerald-100 px-2 text-xs font-bold text-emerald-950 ring-1 ring-inset ring-emerald-300">
                                  <Check className="size-3" aria-hidden /> Prereqs met
                                </span>
                              ) : (
                                <span className="inline-flex h-6 items-center gap-1 rounded-full bg-red-100 px-2 text-xs font-bold text-red-950 ring-1 ring-inset ring-red-300">
                                  <X className="size-3" aria-hidden /> Missing {missing.map((m) => m.code).join(', ')}
                                </span>
                              )}
                            </p>
                            {description && (
                              <p className="mt-1.5 line-clamp-2 text-sm font-medium leading-relaxed text-slate-600">{description}</p>
                            )}
                          </div>
                        </div>
                        <div className={cn('border-t px-4 py-2.5 text-sm', ok ? 'border-emerald-100 bg-emerald-50/60' : 'border-red-100 bg-red-50/60')}>
                          {allPrereqs.length === 0 ? (
                            <p className="font-medium text-slate-600">No prerequisites — open to all students.</p>
                          ) : (
                            <ul className="space-y-1">
                              {allPrereqs.map((p) => {
                                const passed = passedByCode.has(p.code);
                                const score = passedByCode.get(p.code);
                                return (
                                  <li key={p.code} className="flex items-center gap-1.5 font-medium">
                                    {passed ? (
                                      <Check className="size-3.5 shrink-0 text-emerald-700" aria-hidden />
                                    ) : (
                                      <X className="size-3.5 shrink-0 text-red-600" aria-hidden />
                                    )}
                                    <span className={passed ? 'text-emerald-950' : 'text-red-900'}>
                                      {p.code} · {p.name}
                                      {passed && score != null ? ` — passed (${score.toFixed(1)})` : passed ? ' — passed' : ' — not taken'}
                                    </span>
                                  </li>
                                );
                              })}
                            </ul>
                          )}
                        </div>
                      </li>
                    );
                  })}
                </ul>
              </div>

              {/* Validation warnings */}
              {detail.data.plan.issues.length > 0 && (
                <div className="rounded-2xl border border-amber-300 bg-amber-50 px-4 py-3.5">
                  <p className="flex items-center gap-2 text-sm font-extrabold text-amber-950">
                    <TriangleAlert className="size-4 shrink-0" aria-hidden />
                    Validation warnings ({detail.data.plan.issues.length})
                  </p>
                  <ul className="mt-2 list-disc space-y-1.5 pl-5 text-sm font-medium leading-relaxed text-amber-950">
                    {detail.data.plan.issues.map((issue) => (
                      <li key={issue}>{issue}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Structural checks derived locally */}
              {(() => {
                const checks: string[] = [];
                const total = detail.data.plan.header.totalCredits;
                if (total < 14) checks.push(`Credit load is light (${total} cr) — confirm the student meets full-time requirements.`);
                if (total > 20) checks.push(`Credit load is heavy (${total} cr) — recommend dropping 1 course unless GPA ≥ 8.0.`);
                const codes = detail.data.plan.courses.map((c) => c.code);
                if (codes.includes('OJT401') && (student?.totalCreditsEarned ?? 0) < 90)
                  checks.push('OJT401 normally requires ~90+ earned credits — verify eligibility before approving.');
                if (checks.length === 0) return null;
                return (
                  <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3.5 ring-1 ring-inset ring-slate-200">
                    <p className="flex items-center gap-2 text-sm font-extrabold text-slate-900">
                      <ShieldAlert className="size-4 shrink-0 text-[#F26F21]" aria-hidden />
                      Advisor checklist
                    </p>
                    <ul className="mt-2 list-disc space-y-1.5 pl-5 text-sm font-medium leading-relaxed text-slate-700">
                      {checks.map((c) => (
                        <li key={c}>{c}</li>
                      ))}
                    </ul>
                  </div>
                );
              })()}

              {/* Reviewer notes from previous round */}
              {detail.data.plan.header.reviewNotes && (
                <p className="rounded-2xl bg-slate-50 px-4 py-3.5 text-sm font-medium leading-relaxed text-slate-700 ring-1 ring-inset ring-slate-200">
                  <span className="font-extrabold text-slate-900">Previous feedback: </span>
                  {detail.data.plan.header.reviewNotes}
                </p>
              )}

              {/* Decision */}
              {detail.data.plan.header.status === 'SUBMITTED' ? (
                <div className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-5">
                  <h3 className="text-sm font-extrabold uppercase tracking-[0.08em] text-slate-500">
                    Your decision
                  </h3>
                  <div className="mt-3 grid gap-2.5 sm:grid-cols-3" role="radiogroup" aria-label="Review decision">
                    {DECISIONS.map((d) => {
                      const selected = decision === d.key;
                      return (
                        <button
                          key={d.key}
                          type="button"
                          role="radio"
                          aria-checked={selected}
                          onClick={() => setDecision(d.key)}
                          className={cn(
                            'rounded-xl border p-3.5 text-left ring-1 ring-inset transition-all',
                            selected ? d.active : 'border-slate-200 bg-white text-slate-700 ring-transparent hover:border-slate-300',
                          )}
                        >
                          <span className="block text-[15px] font-extrabold">{d.label}</span>
                          <span className={cn('mt-0.5 block text-sm font-medium', selected ? '' : 'text-slate-600')}>
                            {d.hint}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                  <label className="mt-4 block text-sm font-bold text-slate-900" htmlFor="review-comment">
                    Feedback to student{' '}
                    {decision !== 'APPROVED' && <span className="text-red-700">(required)</span>}
                  </label>
                  <textarea
                    id="review-comment"
                    rows={4}
                    maxLength={10000}
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    placeholder={
                      decision === 'APPROVED'
                        ? 'Optional note, e.g. Good balance of 18 credits — good luck this semester.'
                        : 'Explain what to fix, e.g. Replace SE405 (missing prerequisite SE301) and resubmit.'
                    }
                    className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-3.5 py-3 text-sm font-medium text-slate-900 shadow-sm outline-none transition-colors placeholder:font-normal placeholder:text-slate-500 focus:border-[#F26F21] focus:ring-2 focus:ring-[#F26F21]/30"
                  />
                </div>
              ) : (
                <p className="flex items-center gap-2 rounded-xl bg-slate-50 px-4 py-3.5 text-sm font-semibold text-slate-600 ring-1 ring-inset ring-slate-200">
                  This plan is {detail.data.plan.header.status.toLowerCase().replaceAll('_', ' ')} — decisions are locked.
                </p>
              )}
            </div>
          )}
        </div>

        {detail.data?.plan.header.status === 'SUBMITTED' && (
          <div className="flex flex-col gap-2.5 border-t border-slate-200 p-6 sm:flex-row sm:justify-end sm:px-7">
            <button
              type="button"
              onClick={() => setSelectedId('')}
              className="inline-flex h-11 items-center justify-center rounded-xl border border-slate-200 bg-white px-5 text-sm font-bold text-slate-700 shadow-sm transition-colors hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={submit}
              disabled={review.isPending || (decision !== 'APPROVED' && !comment.trim())}
              className="inline-flex h-11 items-center justify-center gap-1.5 rounded-xl bg-[#F26F21] px-6 text-sm font-extrabold text-white shadow-sm transition-colors hover:bg-[#d95f14] disabled:opacity-50"
            >
              {review.isPending ? 'Saving…' : `Confirm ${decision === 'APPROVED' ? 'approval' : decision === 'REJECTED' ? 'rejection' : 'revision request'}`}
            </button>
          </div>
        )}
      </Modal>
    </div>
  );
}
