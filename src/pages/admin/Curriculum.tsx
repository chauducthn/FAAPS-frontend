import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router';
import { CurriculumFilterBar, CurriculumList } from '../../components/admin/curriculum';
import { useCurriculumsQuery } from '../../hooks/queries/useCurriculumsQuery';
import { useDebounce } from '../../hooks/useDebounce';
import type { CurriculumFilterParams } from '../../types/curriculum';

export default function CurriculumPage() {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('ALL');
  const [isCurrent, setIsCurrent] = useState('ALL');
  const [page, setPage] = useState(0);
  const debouncedSearch = useDebounce(search, 300);

  const params: CurriculumFilterParams = useMemo(
    () => ({
      search: debouncedSearch || undefined,
      status: status === 'ALL' ? undefined : (status as 'DRAFT' | 'ACTIVE' | 'ARCHIVED'),
      isCurrent: isCurrent === 'ALL' ? undefined : isCurrent === 'true',
      page,
      size: 20,
    }),
    [debouncedSearch, status, isCurrent, page],
  );

  const { data, isLoading, isError } = useCurriculumsQuery(params);
  const items = data?.items ?? [];
  const totalPages = data?.totalPages ?? 0;

  return (
    <div className="w-full space-y-6">
      <div>
        <h1 className="text-xl font-bold tracking-tight text-gray-900">Curriculum</h1>
        <p className="mt-0.5 text-xs text-gray-500">Browse academic curricula and their courses</p>
      </div>

      <CurriculumFilterBar
        search={search}
        onSearchChange={setSearch}
        status={status}
        onStatusChange={setStatus}
        isCurrent={isCurrent}
        onIsCurrentChange={setIsCurrent}
      />

      {isLoading && <p className="text-xs text-gray-500">Loading curricula...</p>}
      {isError && (
        <p className="text-xs text-red-600">Could not load curricula. Please try again.</p>
      )}
      {!isLoading && !isError && (
        <CurriculumList
          data={items}
          onOpenDetail={(curriculum) => navigate(`/admin/curriculum/${curriculum.id}`)}
        />
      )}

      {totalPages > 1 && (
        <div className="flex items-center justify-between text-xs text-gray-500">
          <span>Page {page + 1} of {totalPages}</span>
          <div className="flex items-center gap-1">
            <button
              disabled={page === 0}
              onClick={() => setPage((current) => Math.max(0, current - 1))}
              className="px-2.5 py-1 hover:text-gray-700 disabled:opacity-50"
            >
              Previous
            </button>
            <button
              disabled={page + 1 >= totalPages}
              onClick={() => setPage((current) => current + 1)}
              className="px-2.5 py-1 hover:text-gray-700 disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
