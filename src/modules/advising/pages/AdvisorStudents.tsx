// src/pages/advising/AdvisorStudents.tsx
// Trang "My Students" — hero cam FPT + stat cards + quick-filter chips + DataTable
// với cell giàu thông tin (avatar, GPA bar, status dot) + Modal 360 (4 tabs).

import { useMemo, useState } from 'react';
import { Link } from 'react-router';
import { GraduationCap, TriangleAlert, UserCheck, UsersRound } from 'lucide-react';
import type { PaginationState, SortingState } from '@tanstack/react-table';
import { DataTable, type DataTableColumnDef } from '../../../shared/components/common/DataTable';
import { useAdviseeStudents } from '../hooks/queries/useAdvisorQueries';
import { advisorService, type AdvisorStudentDetail } from '../services/advisorService';
import type { AcademicStatus, AdviseeStudent } from '../types/advising';
import { Student360Modal } from '../components/Student360Modal';
import { cn } from '@/shared/lib/utils';

const PAGE_SIZE = 10;
const REQUIRED_CREDITS = 132;

const STATUS_OPTIONS: { value: 'ALL' | AcademicStatus; label: string }[] = [
  { value: 'ALL', label: 'Status: All' },
  { value: 'ACTIVE', label: 'Status: Active' },
  { value: 'PROBATION', label: 'Status: Probation' },
  { value: 'SUSPENDED', label: 'Status: Suspended' },
  { value: 'GRADUATED', label: 'Status: Graduated' },
  { value: 'WITHDRAWN', label: 'Status: Withdrawn' },
  { value: 'LEAVE_OF_ABSENCE', label: 'Status: Leave of absence' },
];

const STATUS_STYLES: Record<AcademicStatus, { pill: string; dot: string; label: string }> = {
  ACTIVE: { pill: 'bg-emerald-100 text-emerald-900 ring-emerald-300', dot: 'bg-emerald-600', label: 'Active' },
  PROBATION: { pill: 'bg-orange-100 text-orange-900 ring-orange-300', dot: 'bg-[#F26F21]', label: 'Probation' },
  SUSPENDED: { pill: 'bg-red-100 text-red-900 ring-red-300', dot: 'bg-red-600', label: 'Suspended' },
  GRADUATED: { pill: 'bg-blue-100 text-blue-900 ring-blue-300', dot: 'bg-blue-600', label: 'Graduated' },
  WITHDRAWN: { pill: 'bg-slate-200 text-slate-800 ring-slate-300', dot: 'bg-slate-500', label: 'Withdrawn' },
  LEAVE_OF_ABSENCE: { pill: 'bg-slate-200 text-slate-800 ring-slate-300', dot: 'bg-slate-500', label: 'On leave' },
};

const selectClass =
  'h-11 rounded-xl border border-slate-200 bg-white px-3.5 text-sm font-medium text-slate-900 shadow-sm focus:border-[#F26F21] focus:outline-none focus:ring-2 focus:ring-[#F26F21]/30';

function initialsOf(name: string) {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(-2)
    .map((part) => part[0]?.toUpperCase())
    .join('');
}

function gpaTone(gpa: number | null) {
  if (gpa === null) return { text: 'text-slate-600', bar: 'bg-slate-200' };
  if (gpa >= 8) return { text: 'text-emerald-700', bar: 'bg-emerald-500' };
  if (gpa >= 6.5) return { text: 'text-[#9a4a12]', bar: 'bg-[#F26F21]' };
  if (gpa >= 5) return { text: 'text-amber-700', bar: 'bg-amber-400' };
  return { text: 'text-red-600', bar: 'bg-red-500' };
}

export default function AdvisorStudents() {
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState<'ALL' | AcademicStatus>('ALL');
  const [pagination, setPagination] = useState<PaginationState>({ pageIndex: 0, pageSize: PAGE_SIZE });
  const [sorting, setSorting] = useState<SortingState>([]);
  const [detail, setDetail] = useState<AdvisorStudentDetail | null>(null);
  const [loadingId, setLoadingId] = useState<string | null>(null);

  const queryParams = useMemo(
    () => ({
      search: search || undefined,
      status: status === 'ALL' ? undefined : status,
      page: pagination.pageIndex,
      size: pagination.pageSize,
    }),
    [search, status, pagination.pageIndex, pagination.pageSize],
  );

  const { data, isLoading, isError, refetch } = useAdviseeStudents(queryParams);
  // Tập full (không phân trang) để vẽ stat cards + đếm chips.
  const statsQuery = useAdviseeStudents({ page: 0, size: 200 });
  const items = useMemo(() => data?.items ?? [], [data]);
  const totalItems = data?.totalElements ?? 0;
  const allStudents = useMemo(
    () => statsQuery.data?.items ?? items,
    [statsQuery.data?.items, items],
  );

  const stats = useMemo(() => {
    const total = statsQuery.data?.totalElements ?? totalItems;
    const active = allStudents.filter((s) => s.academicStatus === 'ACTIVE').length;
    const atRisk = allStudents.filter(
      (s) => s.academicStatus === 'PROBATION' || s.academicStatus === 'SUSPENDED',
    ).length;
    const gpas = allStudents.map((s) => s.currentGpa).filter((g): g is number => g !== null);
    const avgGpa = gpas.length ? gpas.reduce((a, b) => a + b, 0) / gpas.length : null;
    const countOf = (v: AcademicStatus) => allStudents.filter((s) => s.academicStatus === v).length;
    return { total, active, atRisk, avgGpa, countOf };
  }, [allStudents, statsQuery.data?.totalElements, totalItems]);

  const resetPage = <T,>(setter: (value: T) => void) => (value: T) => {
    setter(value);
    setPagination((p) => ({ ...p, pageIndex: 0 }));
  };

  const hasFilters = search !== '' || status !== 'ALL';
  const clearFilters = () => {
    setSearch('');
    setStatus('ALL');
    setPagination((p) => ({ ...p, pageIndex: 0 }));
  };

  const pickStatus = (value: 'ALL' | AcademicStatus) => {
    setStatus(value);
    setPagination((p) => ({ ...p, pageIndex: 0 }));
  };

  const openDetail = async (student: AdviseeStudent) => {
    setLoadingId(student.id);
    try {
      const result = await advisorService.getStudentDetail(student.id);
      setDetail(result);
    } finally {
      setLoadingId(null);
    }
  };

  const chips = useMemo(
    () =>
      (['ALL', 'ACTIVE', 'PROBATION', 'SUSPENDED'] as const).map((value) => ({
        value,
        label:
          value === 'ALL'
            ? 'All'
            : STATUS_STYLES[value].label,
        count: value === 'ALL' ? stats.total : stats.countOf(value),
      })),
    [stats],
  );

  const columns = useMemo<DataTableColumnDef<AdviseeStudent>[]>(
    () => [
      {
        accessorKey: 'fullName',
        header: 'Student',
        cell: ({ row }) => {
          const s = row.original;
          return (
            <div className="flex min-w-0 items-center gap-3">
              <span
                aria-hidden
                className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-[#F26F21] to-[#ff9a4d] text-[13px] font-bold text-white shadow-sm"
              >
                {initialsOf(s.fullName)}
              </span>
              <div className="min-w-0">
                <button
                  type="button"
                  onClick={() => openDetail(s)}
                  disabled={loadingId === s.id}
                  className="block max-w-full truncate text-left text-[15px] font-bold text-slate-900 hover:text-[#F26F21] hover:underline disabled:opacity-50"
                >
                  {loadingId === s.id ? 'Loading…' : s.fullName}
                </button>
                <p className="mt-0.5 truncate text-sm font-medium text-slate-600">
                  {s.studentCode} · {s.email}
                </p>
              </div>
            </div>
          );
        },
      },
      {
        accessorKey: 'majorCode',
        header: 'Major',
        enableSorting: false,
        cell: ({ row }) => (
          <div>
            <p className="text-sm font-bold text-slate-900">{row.original.majorCode}</p>
            <p className="max-w-36 truncate text-sm font-medium text-slate-600">{row.original.majorName}</p>
          </div>
        ),
      },
      {
        accessorKey: 'currentSemester',
        header: 'Semester',
        cell: ({ row }) => (
          <div>
            <span className="inline-flex items-center rounded-lg bg-slate-100 px-2 py-0.5 text-xs font-bold text-slate-700">
              Sem {row.original.currentSemester}
            </span>
            <p className="mt-1 text-sm font-medium text-slate-600">{row.original.curriculumVersion}</p>
          </div>
        ),
      },
      {
        accessorKey: 'currentGpa',
        header: 'GPA (/10)',
        cell: ({ row }) => {
          const tone = gpaTone(row.original.currentGpa);
          return (
            <div className="min-w-24">
              <p className={cn('text-sm font-bold tabular-nums', tone.text)}>
                {row.original.currentGpa !== null ? row.original.currentGpa.toFixed(2) : '—'}
              </p>
              <div className="mt-1.5 h-1.5 w-20 overflow-hidden rounded-full bg-slate-100">
                <div
                  className={cn('h-full rounded-full', tone.bar)}
                  style={{ width: `${((row.original.currentGpa ?? 0) / 10) * 100}%` }}
                />
              </div>
            </div>
          );
        },
      },
      {
        accessorKey: 'totalCreditsEarned',
        header: 'Credits',
        cell: ({ row }) => (
          <p className="text-sm tabular-nums">
            <span className="font-bold text-slate-900">{row.original.totalCreditsEarned}</span>
            <span className="text-sm font-medium text-slate-600">/{REQUIRED_CREDITS}</span>
          </p>
        ),
      },
      {
        accessorKey: 'academicStatus',
        header: 'Status',
        enableSorting: false,
        cell: ({ row }) => {
          const style = STATUS_STYLES[row.original.academicStatus];
          return (
            <span
              className={cn(
                'inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-bold ring-1 ring-inset',
                style.pill,
              )}
            >
              <span className={cn('size-1.5 rounded-full', style.dot)} aria-hidden />
              {style.label}
            </span>
          );
        },
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
              onClick={() => openDetail(row.original)}
              disabled={loadingId === row.original.id}
              className="inline-flex h-11 items-center rounded-xl bg-[#F26F21] px-4 text-sm font-bold text-white shadow-sm transition-colors hover:bg-[#d95f14] disabled:opacity-50"
            >
              {loadingId === row.original.id ? 'Loading…' : 'Profile'}
            </button>
          </div>
        ),
      },
    ],
    [loadingId],
  );

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-10 pb-4">
      {/* Hero — đồng bộ Overview: cam đậm + nút trắng là clickable duy nhất */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#b45309] via-[#F26F21] to-[#fb923c] px-6 py-7 text-white shadow-lg shadow-orange-500/20 sm:px-8 sm:py-8">
        <div
          aria-hidden
          className="pointer-events-none absolute -right-14 -top-20 size-64 rounded-full bg-white/15 blur-[1px]"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute -bottom-24 right-48 size-40 rounded-full bg-white/10"
        />
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

      {/* KPI read-only — giống Overview */}
      <div className="grid grid-cols-2 gap-5 lg:grid-cols-4">
        {[
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
        ].map((s) => (
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

      {isError && (
        <div className="rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700">
          Could not load students.{' '}
          <button type="button" onClick={() => refetch()} className="font-semibold underline">
            Retry
          </button>
        </div>
      )}

      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
        {/* Quick-filter chips theo trạng thái — h-11 chuẩn touch target */}
        <div className="mb-4 flex flex-wrap items-center gap-3" role="group" aria-label="Quick filter by status">
          {chips.map((chip) => {
            const active = status === chip.value;
            return (
              <button
                key={chip.value}
                type="button"
                onClick={() => pickStatus(chip.value)}
                aria-pressed={active}
                className={cn(
                  'inline-flex h-11 items-center gap-1.5 rounded-full px-4 text-sm font-bold ring-1 ring-inset transition-colors',
                  active
                    ? 'bg-[#F26F21] text-white ring-[#F26F21] shadow-sm'
                    : 'bg-white text-slate-700 ring-slate-200 hover:bg-[#fff7f0] hover:text-slate-900',
                )}
              >
                {chip.label}
                <span
                  className={cn(
                    'rounded-full px-1.5 py-px text-xs font-bold tabular-nums',
                    active ? 'bg-white/25 text-white' : 'bg-slate-100 text-slate-600',
                  )}
                >
                  {chip.count}
                </span>
              </button>
            );
          })}
        </div>
        <DataTable
          manual
          columns={columns}
          data={items}
          searchKey="fullName"
          searchValue={search}
          searchPlaceholder="Search by name, student ID, or email..."
          emptyText={hasFilters ? 'No students match your filters.' : 'No students assigned yet.'}
          getRowId={(row) => row.id}
          isLoading={isLoading}
          totalRowCount={totalItems}
          pagination={pagination}
          onPaginationChange={setPagination}
          sorting={sorting}
          onSortingChange={setSorting}
          onSearchChange={resetPage(setSearch)}
          filters={
            <>
              <select
                value={status}
                onChange={(e) => resetPage(setStatus)(e.target.value as 'ALL' | AcademicStatus)}
                aria-label="Filter by academic status"
                className={selectClass}
              >
                {STATUS_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
              <button
                type="button"
                onClick={clearFilters}
                disabled={!hasFilters}
                className="inline-flex h-11 items-center rounded-xl px-4 text-sm font-bold text-slate-600 transition-colors hover:bg-slate-100 disabled:opacity-40"
              >
                Clear filters
              </button>
            </>
          }
        />
      </section>

      <Student360Modal detail={detail} onClose={() => setDetail(null)} />
    </div>
  );
}
