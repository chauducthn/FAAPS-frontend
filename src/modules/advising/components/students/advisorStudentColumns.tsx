// DataTable columns and shared styles for AdvisorStudents.

import type { DataTableColumnDef } from '../../../../shared/components/common/DataTable';
import type { AcademicStatus, AdviseeStudent } from '../../types/advising';
import { cn } from '@/shared/lib/utils';

export const STUDENT_STATUS_STYLES: Record<AcademicStatus, { pill: string; dot: string; label: string }> = {
  ACTIVE: { pill: 'bg-emerald-100 text-emerald-900 ring-emerald-300', dot: 'bg-emerald-600', label: 'Active' },
  PROBATION: { pill: 'bg-orange-100 text-orange-900 ring-orange-300', dot: 'bg-[#F26F21]', label: 'Probation' },
  SUSPENDED: { pill: 'bg-red-100 text-red-900 ring-red-300', dot: 'bg-red-600', label: 'Suspended' },
  GRADUATED: { pill: 'bg-blue-100 text-blue-900 ring-blue-300', dot: 'bg-blue-600', label: 'Graduated' },
  WITHDRAWN: { pill: 'bg-slate-200 text-slate-800 ring-slate-300', dot: 'bg-slate-500', label: 'Withdrawn' },
  LEAVE_OF_ABSENCE: { pill: 'bg-slate-200 text-slate-800 ring-slate-300', dot: 'bg-slate-500', label: 'On leave' },
};

function initialsOf(name: string | null | undefined) {
  return (name ?? '')
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

interface BuildColumnsParams {
  loadingId: string | null;
  requiredCreditsFor: (student: AdviseeStudent) => number | null | undefined;
  defaultRequiredCredits: number;
  onOpenDetail: (student: AdviseeStudent) => void;
}

export function buildAdvisorStudentColumns({
  loadingId,
  requiredCreditsFor,
  defaultRequiredCredits,
  onOpenDetail,
}: BuildColumnsParams): DataTableColumnDef<AdviseeStudent>[] {
  return [
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
                onClick={() => onOpenDetail(s)}
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
              {row.original.currentGpa != null ? row.original.currentGpa.toFixed(2) : '—'}
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
      cell: ({ row }) => {
        const required = requiredCreditsFor(row.original) ?? defaultRequiredCredits;
        return (
          <p className="text-sm tabular-nums">
            <span className="font-bold text-slate-900">{row.original.totalCreditsEarned}</span>
            <span className="text-sm font-medium text-slate-600">/{required}</span>
          </p>
        );
      },
    },
    {
      accessorKey: 'academicStatus',
      header: 'Status',
      enableSorting: false,
      cell: ({ row }) => {
        const style = STUDENT_STATUS_STYLES[row.original.academicStatus] ?? STUDENT_STATUS_STYLES.ACTIVE;
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
            onClick={() => onOpenDetail(row.original)}
            disabled={loadingId === row.original.id}
            className="inline-flex h-11 items-center rounded-xl bg-[#F26F21] px-4 text-sm font-bold text-white shadow-sm transition-colors hover:bg-[#d95f14] disabled:opacity-50"
          >
            {loadingId === row.original.id ? 'Loading…' : 'Profile'}
          </button>
        </div>
      ),
    },
  ];
}
