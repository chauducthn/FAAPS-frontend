// src/pages/admin/Cohorts.tsx
import { useMemo, useState } from 'react';
import { CohortTable, CohortFilterBar } from '../../components/admin/cohorts';
import { useCohortsQuery } from '../../hooks/queries/useCohortsQuery';
import { useDebounce } from '../../hooks/useDebounce';
import type { CohortFilterParams } from '../../types/cohort';

export default function CohortsPage() {
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('ALL');
  const [page, setPage] = useState(0);
  const debouncedSearch = useDebounce(search, 300);

  const params: CohortFilterParams = useMemo(
    () => ({
      search: debouncedSearch || undefined,
      status: status === 'ALL' ? undefined : (status as 'ACTIVE' | 'INACTIVE'),
      page,
      size: 20,
    }),
    [debouncedSearch, status, page],
  );

  const { data, isLoading, isError } = useCohortsQuery(params);
  const items = data?.items ?? [];
  const totalPages = data?.totalPages ?? 0;

  return (
    <div className="w-full space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900 tracking-tight">Cohorts</h1>
          <p className="text-xs text-gray-500 mt-0.5">Browse cohort details and enrollment status</p>
        </div>
      </div>

      <CohortFilterBar
        search={search}
        onSearchChange={setSearch}
        status={status}
        onStatusChange={setStatus}
      />

      {isLoading && <p className="text-xs text-gray-500">Loading cohorts...</p>}
      {isError && (
        <p className="text-xs text-red-600">
          Could not load cohorts. Check the backend connection and try again.
        </p>
      )}
      {!isLoading && !isError && (
        <CohortTable data={items} />
      )}

      {totalPages > 1 && (
        <div className="flex items-center justify-between text-xs text-gray-500">
          <span>
            Page {page + 1} of {totalPages}
          </span>
          <div className="flex items-center gap-1">
            <button
              disabled={page === 0}
              onClick={() => setPage((p) => Math.max(0, p - 1))}
              className="px-2.5 py-1 text-gray-400 hover:text-gray-700 disabled:opacity-50"
            >
              Previous
            </button>
            <button
              disabled={page + 1 >= totalPages}
              onClick={() => setPage((p) => p + 1)}
              className="px-2.5 py-1 text-gray-400 hover:text-gray-700 disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
