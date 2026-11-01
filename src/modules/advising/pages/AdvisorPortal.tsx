// src/pages/advising/AdvisorPortal.tsx
// Dashboard Cố vấn — SIMPLIFIED (audit 37/100):
// Hero dịu + KPI phẳng + quick links nhẹ + 3 kiểu nút chuẩn + chữ >=14px + thở.

import { useMemo, useState } from 'react';
import { Link } from 'react-router';
import {
  ArrowRight,
  BookOpen,
  CalendarDays,
  CircleCheckBig,
  HelpCircle,
  Hourglass,
  Inbox,
  Search,
  TriangleAlert,
  UsersRound,
} from 'lucide-react';
import { useAuth } from '../../auth/stores/useAuth';
import { useAdviseeStudents, useAdvisorAdvisingRequests } from '../hooks/queries/useAdvisorQueries';
import { RequestListTable } from '../components/RequestListTable';
import { cn } from '@/shared/lib/utils';
import type { AcademicStatus } from '../types/advising';

const COUNT_SIZE = 50;
const REQUIRED_CREDITS = 132;

const STATUS_STYLES: Record<AcademicStatus, { pill: string; dot: string; label: string }> = {
  ACTIVE: { pill: 'bg-emerald-100 text-emerald-900 ring-emerald-300', dot: 'bg-emerald-600', label: 'Active' },
  PROBATION: { pill: 'bg-orange-100 text-orange-900 ring-orange-300', dot: 'bg-[#F26F21]', label: 'Probation' },
  SUSPENDED: { pill: 'bg-red-100 text-red-900 ring-red-300', dot: 'bg-red-600', label: 'Suspended' },
  GRADUATED: { pill: 'bg-blue-100 text-blue-900 ring-blue-300', dot: 'bg-blue-600', label: 'Graduated' },
  WITHDRAWN: { pill: 'bg-slate-200 text-slate-800 ring-slate-300', dot: 'bg-slate-500', label: 'Withdrawn' },
  LEAVE_OF_ABSENCE: { pill: 'bg-slate-200 text-slate-800 ring-slate-300', dot: 'bg-slate-500', label: 'On leave' },
};

/** Tooltip học vụ nhỏ: hover/focus vào (?) hiện giải thích. Đạt WCAG AA contrast. */
function TermTip({ term, tip }: { term: string; tip: string }) {
  return (
    <span className="group relative inline-flex items-center">
      <span
        tabIndex={0}
        role="button"
        aria-label={`${term}: ${tip}`}
        className="inline-flex cursor-help items-center gap-0.5 rounded-full px-0.5 text-slate-600 outline-none hover:text-[#F26F21] focus-visible:ring-2 focus-visible:ring-[#F26F21]/50"
      >
        <HelpCircle className="size-4" aria-hidden />
      </span>
      <span
        role="tooltip"
        className="pointer-events-none absolute bottom-full left-1/2 z-20 mb-2 w-52 -translate-x-1/2 rounded-xl border border-slate-200 bg-slate-900 px-3 py-2 text-left text-sm font-normal leading-relaxed text-white opacity-0 shadow-xl transition-opacity duration-150 group-hover:opacity-100 group-focus-within:opacity-100"
      >
        <span className="mb-0.5 block text-xs font-bold uppercase tracking-wide text-orange-200">{term}</span>
        {tip}
      </span>
    </span>
  );
}

function initialsOf(name: string) {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(-2)
    .map((part) => part[0]?.toUpperCase())
    .join('');
}

function greeting() {
  const h = new Date().getHours();
  if (h < 11) return 'Good morning';
  if (h < 14) return 'Good noon';
  if (h < 18) return 'Good afternoon';
  return 'Good evening';
}

export default function AdvisorPortal() {
  const user = useAuth((s) => s.user);
  const [search, setSearch] = useState('');

  const studentsQuery = useAdviseeStudents({ page: 0, size: COUNT_SIZE });
  const pendingQuery = useAdvisorAdvisingRequests({ status: 'PENDING' });
  const inProgressQuery = useAdvisorAdvisingRequests({ status: 'IN_PROGRESS' });
  const resolvedQuery = useAdvisorAdvisingRequests({ status: 'RESOLVED' });

  const students = useMemo(() => studentsQuery.data?.items ?? [], [studentsQuery.data?.items]);
  const totalStudents = studentsQuery.data?.totalElements ?? students.length;

  const atRisk = useMemo(
    () => students.filter((s) => s.academicStatus === 'PROBATION' || s.academicStatus === 'SUSPENDED'),
    [students],
  );

  const topStudents = useMemo(() => students.slice(0, 5), [students]);

  const pendingCount = pendingQuery.data?.length ?? 0;

  // KPI read-only: tĩnh, không hover — phân biệt rõ với cards clickable.
  // Pending là điểm nhấn duy nhất (icon cam đặc), 3 KPI còn lại icon neutral.
  const stats = [
    {
      label: 'Assigned Students',
      value: studentsQuery.isLoading ? '–' : String(totalStudents),
      sub: `${atRisk.length} at risk`,
      icon: UsersRound,
      iconBox: 'bg-slate-900 text-white shadow-[0_6px_16px_-6px_rgba(15,23,42,0.5)]',
      topBar: 'bg-slate-900',
    },
    {
      label: 'Pending',
      value: pendingQuery.isLoading ? '–' : String(pendingQuery.data?.length ?? '–'),
      sub: 'needs response',
      icon: Inbox,
      iconBox: 'bg-[#F26F21] text-white shadow-[0_6px_16px_-6px_rgba(242,111,33,0.6)]',
      topBar: 'bg-[#F26F21]',
    },
    {
      label: 'In Progress',
      value: inProgressQuery.isLoading ? '–' : String(inProgressQuery.data?.length ?? '–'),
      sub: 'being handled',
      icon: Hourglass,
      iconBox: 'bg-slate-100 text-slate-700 ring-1 ring-inset ring-slate-200',
      topBar: 'bg-slate-300',
    },
    {
      label: 'Resolved',
      value: resolvedQuery.isLoading ? '–' : String(resolvedQuery.data?.length ?? '–'),
      sub: 'completed',
      icon: CircleCheckBig,
      iconBox: 'bg-emerald-600 text-white shadow-[0_6px_16px_-6px_rgba(5,150,105,0.5)]',
      topBar: 'bg-emerald-600',
    },
  ];

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-10 pb-4">
      {/* ── Hero: điểm nhấn đầu trang — cam FPT đậm, nút trắng nổi rõ là clickable ── */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#b45309] via-[#F26F21] to-[#fb923c] px-6 py-7 text-white shadow-lg shadow-orange-500/20 sm:px-8 sm:py-8">
        <div aria-hidden className="pointer-events-none absolute -right-14 -top-20 size-64 rounded-full bg-white/15 blur-[1px]" />
        <div aria-hidden className="pointer-events-none absolute -bottom-24 right-48 size-40 rounded-full bg-white/10" />
        <div aria-hidden className="pointer-events-none absolute inset-x-0 bottom-0 h-px bg-white/30" />
        <div className="relative flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-[26px] font-extrabold leading-tight tracking-tight text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.15)]">
              {greeting()}, {user?.fullName ?? 'Advisor'}
            </h1>
            <p className="mt-2 max-w-xl text-sm font-medium leading-relaxed text-white/95">
              {pendingCount > 0
                ? `${pendingCount} pending request${pendingCount === 1 ? '' : 's'} need your response today.`
                : 'No pending requests right now. Nice work!'}
            </p>
          </div>
          {/* Primary trên nền cam = nút trắng — nhìn là biết bấm được */}
          <Link
            to="/advisor/advising-requests"
            className="inline-flex h-11 shrink-0 items-center justify-center gap-1.5 rounded-xl bg-white px-5 text-sm font-extrabold text-[#c2410c] shadow-[0_4px_14px_rgba(0,0,0,0.18)] transition-all hover:bg-orange-50 hover:shadow-[0_6px_20px_rgba(0,0,0,0.22)] active:scale-[0.98]"
          >
            Review requests <ArrowRight className="size-4" aria-hidden />
          </Link>
        </div>
      </div>

      {/* ── 4 KPI read-only: tĩnh, không hover — phân biệt rõ với cards clickable ── */}
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
                <p className="mt-2.5 text-[30px] font-extrabold leading-none tabular-nums text-slate-900">
                  {s.value}
                </p>
                <p className="mt-2 text-sm font-medium text-slate-600">{s.sub}</p>
              </div>
              <span
                className={cn(
                  'flex size-11 shrink-0 items-center justify-center rounded-xl',
                  s.iconBox,
                )}
              >
                <s.icon className="size-5" aria-hidden strokeWidth={2.25} />
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* ── Quick links = clickable: viền, bóng, hover nâng nhẹ + mũi tên cam ── */}
      <div className="grid gap-5 sm:grid-cols-3">
        {[
          { to: '/advisor/students', icon: UsersRound, title: 'My Students', desc: `${totalStudents} assigned · ${atRisk.length} at risk` },
          { to: '/advisor/appointments', icon: CalendarDays, title: 'Appointments', desc: 'Calendar & list views' },
          { to: '/advisor/academic-lookup', icon: BookOpen, title: 'Academic Lookup', desc: 'Curricula & courses' },
        ].map((l) => (
          <Link
            key={l.to}
            to={l.to}
            className="group flex min-h-[80px] items-center gap-3.5 rounded-2xl border border-slate-200 bg-white p-5 shadow-[0_1px_2px_rgba(15,23,42,0.06),0_8px_24px_-14px_rgba(15,23,42,0.22)] transition-all hover:-translate-y-[1px] hover:border-[#F26F21]/50 hover:shadow-[0_2px_4px_rgba(15,23,42,0.06),0_14px_32px_-12px_rgba(242,111,33,0.35)]"
          >
            <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-[#F26F21] to-[#ff9a4d] text-white shadow-[0_6px_16px_-6px_rgba(242,111,33,0.7)]">
              <l.icon className="size-5" aria-hidden strokeWidth={2.25} />
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

      {/* ── Advising Requests: điểm nhấn chính duy nhất (nút Accept trong bảng) ── */}
      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h2 className="text-lg font-bold tracking-tight text-slate-900">Advising Requests</h2>
            <p className="mt-1.5 text-sm font-medium leading-relaxed text-slate-600">
              One primary action per row — extras live under More.
            </p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <label className="flex h-11 w-full items-center gap-2 rounded-xl border border-slate-200 bg-white px-3.5 transition-colors focus-within:border-[#F26F21] focus-within:ring-2 focus-within:ring-[#F26F21]/30 sm:w-72">
              <Search className="size-4 shrink-0 text-slate-500" aria-hidden />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by student or title..."
                aria-label="Search requests"
                className="flex-1 bg-transparent text-sm font-medium text-slate-900 outline-none placeholder:font-normal placeholder:text-slate-500"
              />
            </label>
            {/* Ghost */}
            <Link
              to="/advisor/advising-requests"
              className="inline-flex h-11 items-center justify-center gap-1.5 rounded-xl px-4 text-sm font-bold text-[#F26F21] transition-colors hover:bg-[#fff3ea]"
            >
              View all <ArrowRight className="size-4" aria-hidden />
            </Link>
          </div>
        </div>

        <div className="mt-6">
          <RequestListTable search={search.trim()} />
        </div>
      </section>

      {/* ── Assigned Students: Secondary, chữ >=14px ── */}
      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="flex items-center gap-1.5 text-lg font-bold tracking-tight text-slate-900">
              Assigned Students
              <TermTip
                term="Cohort"
                tip="Cohort = khóa/lứa nhập học của sinh viên (ví dụ K17, K18). Sinh viên cùng cohort học cùng chương trình đào tạo."
              />
            </h2>
            <p className="mt-1.5 text-sm font-medium text-slate-600">
              {totalStudents} students · {atRisk.length} need attention
            </p>
          </div>
          {/* Secondary — không tranh Primary với nút Accept */}
          <Link
            to="/advisor/students"
            className="inline-flex h-11 items-center justify-center gap-1.5 rounded-xl border border-slate-200 bg-white px-5 text-sm font-bold text-slate-700 shadow-sm transition-colors hover:border-[#F26F21]/40 hover:text-[#F26F21]"
          >
            Open My Students <ArrowRight className="size-4" aria-hidden />
          </Link>
        </div>

        {/* Legend thuật ngữ học vụ — chữ 14px */}
        <div className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-2 rounded-xl bg-slate-50 px-4 py-3.5 text-sm font-medium text-slate-700 ring-1 ring-inset ring-slate-200">
          <span className="font-bold text-slate-900">Academic terms:</span>
          <span className="inline-flex items-center gap-1">
            GPA
            <TermTip term="GPA" tip="Grade Point Average — điểm trung bình tích lũy thang 10. >= 8 Giỏi, 6.5–8 Khá, 5–6.5 Trung bình, < 5 Nguy cơ probation." />
          </span>
          <span className="inline-flex items-center gap-1">
            Probation
            <TermTip term="Probation" tip="Cảnh báo học vụ — sinh viên có GPA thấp hoặc nợ tín chỉ, cần gặp advisor sớm để lập kế hoạch cải thiện." />
          </span>
          <span className="inline-flex items-center gap-1">
            OJT
            <TermTip term="OJT" tip="On-the-Job Training — kỳ thực tập tại doanh nghiệp, thường ở năm 3. Sinh viên cần đủ tín chỉ và GPA tối thiểu." />
          </span>
          <span className="inline-flex items-center gap-1">
            Credits
            <TermTip term="Credits" tip="Tín chỉ tích lũy / 132 tín chỉ yêu cầu tốt nghiệp. Thanh tiến trình bên dưới mỗi thẻ cho biết % hoàn thành." />
          </span>
        </div>

        {atRisk.length > 0 && (
          <p className="mt-5 flex items-start gap-2 rounded-xl border border-orange-200 bg-orange-50 px-4 py-3.5 text-sm font-semibold leading-relaxed text-orange-950">
            <TriangleAlert className="mt-0.5 size-4 shrink-0" aria-hidden />
            {atRisk.length} student{atRisk.length === 1 ? ' is' : 's are'} on probation/suspended — check in soon.
          </p>
        )}

        <div className="mt-6">
          {studentsQuery.isLoading ? (
            <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <li key={i} className="flex items-center gap-3 rounded-2xl border border-slate-200 p-5">
                  <span className="size-12 shrink-0 animate-pulse rounded-xl bg-slate-100" />
                  <div className="flex-1 space-y-2">
                    <div className="h-3.5 w-2/3 animate-pulse rounded bg-slate-100" />
                    <div className="h-3 w-1/3 animate-pulse rounded bg-slate-100" />
                  </div>
                </li>
              ))}
            </ul>
          ) : studentsQuery.isError ? (
            <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-4 text-sm font-medium text-red-800">
              Could not load students.{' '}
              <button type="button" onClick={() => studentsQuery.refetch()} className="h-11 font-bold underline">
                Retry
              </button>
            </div>
          ) : topStudents.length === 0 ? (
            <p className="rounded-xl bg-slate-50 px-4 py-8 text-center text-sm font-medium text-slate-600">
              No students assigned yet.
            </p>
          ) : (
            <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {topStudents.map((s) => {
                const style = STATUS_STYLES[s.academicStatus];
                const pct = Math.min(100, Math.round((s.totalCreditsEarned / REQUIRED_CREDITS) * 100));
                const gpaColor =
                  s.currentGpa === null
                    ? 'text-slate-600'
                    : s.currentGpa >= 8
                      ? 'text-emerald-700'
                      : s.currentGpa >= 6.5
                        ? 'text-orange-900'
                        : s.currentGpa >= 5
                          ? 'text-amber-800'
                          : 'text-red-700';
                return (
                  <li
                    key={s.id}
                    className="rounded-2xl border border-slate-200 bg-white p-5 transition-shadow hover:shadow-md"
                  >
                    <Link to="/advisor/students" className="flex items-center gap-3 rounded-xl p-1">
                      <span
                        aria-hidden
                        className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-[#F26F21] to-[#ff9a4d] text-sm font-extrabold text-white shadow-sm"
                      >
                        {initialsOf(s.fullName)}
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-[15px] font-bold text-slate-900">
                          {s.fullName}
                        </span>
                        <span className="mt-0.5 block truncate text-sm font-medium text-slate-600">
                          {s.studentCode} · {s.majorCode} · Sem {s.currentSemester}
                        </span>
                      </span>
                      <span className={cn('text-lg font-bold tabular-nums', gpaColor)}>
                        {s.currentGpa !== null ? s.currentGpa.toFixed(2) : '—'}
                      </span>
                    </Link>
                    <div className="mt-3 flex items-center justify-between gap-2 px-1">
                      <span
                        className={cn(
                          'inline-flex h-7 items-center gap-1.5 rounded-full px-2.5 text-sm font-bold ring-1 ring-inset',
                          style.pill,
                        )}
                      >
                        <span className={cn('size-1.5 rounded-full', style.dot)} aria-hidden />
                        {style.label}
                        {(s.academicStatus === 'PROBATION' || s.academicStatus === 'SUSPENDED') && (
                          <TermTip
                            term={style.label}
                            tip="Sinh viên đang bị cảnh báo/đình chỉ học vụ — ưu tiên liên hệ và lập kế hoạch hỗ trợ."
                          />
                        )}
                      </span>
                      <span className="text-sm font-semibold tabular-nums text-slate-600">
                        {s.totalCreditsEarned}/{REQUIRED_CREDITS} credits
                      </span>
                    </div>
                    <div
                      className="mx-1 mt-2.5 h-1.5 overflow-hidden rounded-full bg-slate-100"
                      role="progressbar"
                      aria-valuenow={pct}
                      aria-valuemin={0}
                      aria-valuemax={100}
                      aria-label={`Credits progress ${pct}%`}
                    >
                      <span
                        className="block h-full rounded-full bg-gradient-to-r from-[#F26F21] to-[#ff9a4d]"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </section>
    </div>
  );
}
