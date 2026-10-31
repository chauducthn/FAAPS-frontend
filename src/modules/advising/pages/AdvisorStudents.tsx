// src/pages/advising/AdvisorStudents.tsx
// Trang "My Students" — hero cam FPT + stat cards + quick-filter chips + DataTable
// với cell giàu thông tin (avatar, GPA bar, status dot) + Modal 360 (4 tabs).

import { useMemo, useState } from 'react';
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
  ACTIVE: { pill: 'bg-emerald-50 text-emerald-700 ring-emerald-200', dot: 'bg-emerald-500', label: 'Active' },
  PROBATION: { pill: 'bg-orange-50 text-orange-700 ring-orange-200', dot: 'bg-[#F26F21]', label: 'Probation' },
  SUSPENDED: { pill: 'bg-red-50 text-red-700 ring-red-200', dot: 'bg-red-500', label: 'Suspended' },
  GRADUATED: { pill: 'bg-blue-50 text-blue-700 ring-blue-200', dot: 'bg-blue-500', label: 'Graduated' },
  WITHDRAWN: { pill: 'bg-slate-100 text-slate-600 ring-slate-200', dot: 'bg-slate-400', label: 'Withdrawn' },
  LEAVE_OF_ABSENCE: { pill: 'bg-slate-100 text-slate-600 ring-slate-200', dot: 'bg-slate-400', label: 'On leave' },
};

const selectClass =
  'h-10 rounded-lg border border-slate-200 bg-white px-3 text-sm font-medium text-[#151c27] shadow-sm focus:border-[#F26F21] focus:outline-none focus:ring-1 focus:ring-[#F26F21]/40';

function initialsOf(name: string) {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(-2)
    .map((part) => part[0]?.toUpperCase())
    .join('');
}

function gpaTone(gpa: number | null) {
  if (gpa === null) return { text: 'text-slate-400', bar: 'bg-slate-200' };
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
                  className="block max-w-full truncate text-left text-sm font-semibold text-[#151c27] hover:text-[#F26F21] hover:underline disabled:opacity-50"
                >
                  {loadingId === s.id ? 'Loading…' : s.fullName}
                </button>
                <p className="mt-0.5 truncate text-xs text-slate-400">
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
            <p className="text-sm font-semibold text-[#151c27]">{row.original.majorCode}</p>
            <p className="max-w-36 truncate text-xs text-slate-400">{row.original.majorName}</p>
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
            <p className="mt-1 text-xs text-slate-400">{row.original.curriculumVersion}</p>
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
            <span className="font-bold text-[#151c27]">{row.original.totalCreditsEarned}</span>
            <span className="text-xs text-slate-400">/{REQUIRED_CREDITS}</span>
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
                'inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-bold ring-1 ring-inset',
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
              className="rounded-lg bg-[#F26F21] px-3 py-1.5 text-xs font-bold text-white shadow-sm transition-colors hover:bg-[#d95f14] disabled:opacity-50"
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
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-5">
      {/* Hero cam FPT */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#F26F21] to-[#ff8f3f] p-6 text-white shadow-sm">
        <div
          aria-hidden
          className="pointer-events-none absolute -right-12 -top-16 size-56 rounded-full bg-white/10"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute -bottom-20 right-40 size-36 rounded-full bg-white/10"
        />
        <div className="relative">
          <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-white/80">
            Advisor / My Students
          </p>
          <h1 className="mt-1 flex items-center gap-2 text-2xl font-bold">
            <UsersRound className="size-6" aria-hidden />
            My Students
          </h1>
          <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
            {[
              { icon: UsersRound, label: 'Assigned', value: String(stats.total) },
              { icon: UserCheck, label: 'Active', value: String(stats.active) },
              { icon: TriangleAlert, label: 'At risk', value: String(stats.atRisk) },
              {
                icon: GraduationCap,
                label: 'Avg GPA',
                value: stats.avgGpa !== null ? stats.avgGpa.toFixed(2) : '—',
              },
            ].map((s) => (
              <div key={s.label} className="rounded-xl bg-white/15 px-3 py-2.5 backdrop-blur-sm">
                <p className="flex items-center gap-1.5 text-[11px] font-medium text-white/80">
                  <s.icon className="size-3.5" aria-hidden />
                  {s.label}
                </p>
                <p className="mt-0.5 text-xl font-bold tabular-nums">{s.value}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {isError && (
        <div className="rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700">
          Could not load students.{' '}
          <button type="button" onClick={() => refetch()} className="font-semibold underline">
            Retry
          </button>
        </div>
      )}

      <section className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm sm:p-5">
        {/* Quick-filter chips theo trạng thái */}
        <div className="mb-1 flex flex-wrap items-center gap-2" role="group" aria-label="Quick filter by status">
          {chips.map((chip) => {
            const active = status === chip.value;
            return (
              <button
                key={chip.value}
                type="button"
                onClick={() => pickStatus(chip.value)}
                aria-pressed={active}
                className={cn(
                  'inline-flex h-8 items-center gap-1.5 rounded-full px-3 text-[13px] font-semibold ring-1 ring-inset transition-colors',
                  active
                    ? 'bg-[#F26F21] text-white ring-[#F26F21]'
                    : 'bg-white text-slate-600 ring-slate-200 hover:bg-slate-50 hover:text-slate-900',
                )}
              >
                {chip.label}
                <span
                  className={cn(
                    'rounded-full px-1.5 py-px text-[11px] font-bold tabular-nums',
                    active ? 'bg-white/25 text-white' : 'bg-slate-100 text-slate-500',
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
                className="h-10 rounded-lg px-3 text-sm font-medium text-[#555f6f] hover:bg-gray-50 disabled:opacity-40"
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
