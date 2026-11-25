// My Students page for advisors with quick filters, DataTable, and Student 360 modal.

import { useCallback, useMemo, useState } from 'react';
import { toast } from 'sonner';
import type { PaginationState, SortingState } from '@tanstack/react-table';
import { DataTable } from '../../../shared/components/common/DataTable';
import { useAdviseeStudents } from '../hooks/queries/useAdvisorQueries';
import { useRequiredCredits } from '../hooks/queries/useRequiredCredits';
import { advisorService, type AdvisorStudentDetail } from '../services/advisorService';
import type { AcademicStatus, AdviseeStudent } from '../types/advising';
import { Student360Modal } from '../components/Student360Modal';
import { apiMessage } from '../../../shared/lib/apiMessage';
import {
  AdvisorStudentsHeader,
  STUDENT_STATUS_OPTIONS,
  StudentQuickFilterChips,
} from '../components/students/AdvisorStudentsHeader';
import {
  buildAdvisorStudentColumns,
  STUDENT_STATUS_STYLES,
} from '../components/students/advisorStudentColumns';

const PAGE_SIZE = 10;

const selectClass =
  'h-11 rounded-xl border border-slate-200 bg-white px-3.5 text-sm font-medium text-slate-900 shadow-sm focus:border-[#F26F21] focus:outline-none focus:ring-2 focus:ring-[#F26F21]/30';

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
  const statsQuery = useAdviseeStudents({ page: 0, size: 100 });
  const { requiredCreditsFor, defaultRequiredCredits } = useRequiredCredits();
  const items = useMemo(() => data?.items ?? [], [data]);
  const totalItems = data?.totalElements ?? 0;
  const allStudents = useMemo(() => statsQuery.data?.items ?? items, [statsQuery.data?.items, items]);

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

  const openDetail = useCallback(async (student: AdviseeStudent) => {
    setLoadingId(student.id);
    try {
      const result = await advisorService.getStudentDetail(student.id);
      setDetail(result);
    } catch (error) {
      toast.error(apiMessage(error));
    } finally {
      setLoadingId(null);
    }
  }, []);

  const chips = useMemo(
    () =>
      (['ALL', 'ACTIVE', 'PROBATION', 'SUSPENDED'] as const).map((value) => ({
        value,
        label: value === 'ALL' ? 'All' : STUDENT_STATUS_STYLES[value].label,
        count: value === 'ALL' ? stats.total : stats.countOf(value),
      })),
    [stats],
  );

  const columns = useMemo(
    () =>
      buildAdvisorStudentColumns({
        loadingId,
        requiredCreditsFor,
        defaultRequiredCredits,
        onOpenDetail: openDetail,
      }),
    [loadingId, requiredCreditsFor, defaultRequiredCredits, openDetail],
  );

  return (
    <div className="w-full space-y-6 pb-4">
      <AdvisorStudentsHeader stats={stats} />

      {isError && (
        <div className="rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700">
          Could not load students.{' '}
          <button type="button" onClick={() => refetch()} className="font-semibold underline">Retry</button>
        </div>
      )}

      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
        <StudentQuickFilterChips chips={chips} status={status} onSelect={pickStatus} />
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
                {STUDENT_STATUS_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>{o.label}</option>
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
