import { Link } from 'react-router';
import { FolderPlus, X } from 'lucide-react';
import { LoadBadge } from '../../components/LoadBadge';
import { UserInitials } from '../../components/UserInitials';
import { Pagination } from '../../components/Pagination';
import { AdvisorRowMenu } from '../../components/AdvisorRowMenu';
import { StaticTable, type StaticColumn } from '../../../../shared/components/common/table/StaticTable';

export interface AdvisorRowItem {
  id: string;
  email: string;
  name: string;
  limit: number | null;
  chips: { key: string; majorCode: string; cohort: string; inPool: boolean; students: number }[];
}

export function AdvisorsTableSection(props: {
  advisorList: AdvisorRowItem[];
  page: number;
  pageSize: number;
  isLoading: boolean;
  isError: boolean;
  hasFilter: boolean;
  loadOf: (id: string) => number;
  selectedIds: Set<string>;
  onToggleOne: (id: string) => void;
  onToggleAll: (ids: string[], allSelected: boolean) => void;
  onClearSelection: () => void;
  onBulkAssignCohorts: (advisors: { id: string; name: string }[]) => void;
  onRetry: () => void;
  onAssignCohort: (advisor: AdvisorRowItem) => void;
  onEditLimit: (advisor: AdvisorRowItem) => void;
  onOpenDetails: (advisorId: string) => void;
  onPageChange: (page: number) => void;
}) {
  const { advisorList, page, pageSize, isLoading, isError, hasFilter, loadOf, selectedIds } = props;
  const rows = advisorList.slice(page * pageSize, (page + 1) * pageSize);
  const pageIds = rows.map((r) => r.id);
  const allPageSelected = pageIds.length > 0 && pageIds.every((id) => selectedIds.has(id));
  const selectedAdvisors = advisorList.filter((a) => selectedIds.has(a.id)).map((a) => ({ id: a.id, name: a.name }));

  const columns: StaticColumn<AdvisorRowItem>[] = [
    {
      key: 'advisor',
      header: 'Advisor',
      render: (advisor) => (
        <div className="flex min-w-0 items-center gap-2.5">
          <UserInitials name={advisor.name} />
          <span className="truncate text-[13px] font-semibold text-gray-900">{advisor.name}</span>
        </div>
      ),
    },
    {
      key: 'email',
      header: 'Email',
      render: (advisor) => <span className="block truncate text-[13px] text-gray-600">{advisor.email}</span>,
    },
    {
      key: 'load',
      header: 'Workload',
      render: (advisor) => <LoadBadge count={loadOf(advisor.id)} limit={advisor.limit} />,
    },
    {
      key: 'majors',
      header: 'Major',
      render: (advisor) => {
        const majorCodes = [...new Set(advisor.chips.map((c) => c.majorCode).filter(Boolean))];
        return majorCodes.length === 0 ? (
          <span className="text-xs text-gray-400">—</span>
        ) : (
          <span className="text-[13px] font-semibold text-gray-700">{majorCodes.join(', ')}</span>
        );
      },
    },
    {
      key: 'cohorts',
      header: 'Cohort',
      render: (advisor) =>
        advisor.chips.length === 0 ? (
          <span className="text-xs text-gray-400">No cohort assigned</span>
        ) : (
          <div className="flex flex-wrap gap-2">
            {advisor.chips.map((chip) => (
              <Link
                key={chip.key}
                to={`/admin/assignments/cohorts/${chip.key}`}
                className="inline-flex items-center text-[13px] font-semibold text-[#C2410C] transition-colors hover:underline"
                title={`${chip.majorCode} — ${chip.cohort}`}
              >
                {chip.cohort}
              </Link>
            ))}
          </div>
        ),
    },
    {
      key: 'actions',
      header: 'Actions',
      align: 'right',
      render: (advisor) => (
        <div className="flex justify-end">
          <AdvisorRowMenu
            advisorName={advisor.name}
            onAssignCohort={() => props.onAssignCohort(advisor)}
            onEditLimit={() => props.onEditLimit(advisor)}
            onOpenDetails={() => props.onOpenDetails(advisor.id)}
          />
        </div>
      ),
    },
  ];

  return (
    <div className="flex h-[520px] flex-col">
      <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
        {selectedIds.size > 0 && (
          <div role="region" aria-label="Advisor bulk actions" className="flex shrink-0 flex-wrap items-center justify-between gap-2.5 border-b border-orange-200/80 bg-orange-50/70 px-4 py-2.5">
            <div className="flex items-center gap-2">
              <span className="rounded-md bg-[#F26F21] px-2 py-0.5 text-xs font-semibold tabular-nums text-white">
                {selectedIds.size} advisor{selectedIds.size === 1 ? '' : 's'} selected
              </span>
              <button type="button" onClick={props.onClearSelection} className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium text-gray-600 hover:bg-orange-100/80 hover:text-gray-900">
                <X className="size-3.5" aria-hidden /> Clear
              </button>
            </div>
            <button
              type="button"
              onClick={() => props.onBulkAssignCohorts(selectedAdvisors)}
              className="inline-flex items-center gap-1.5 rounded-lg bg-[#F26F21] px-3 py-1.5 text-[13px] font-semibold text-white transition-colors hover:bg-[#e05f14]"
            >
              <FolderPlus className="size-3.5" aria-hidden /> Assign cohort
            </button>
          </div>
        )}
        <StaticTable
          stickyHeader
          className="min-h-0 flex-1 overflow-auto"
          columns={columns}
          rows={rows}
          rowKey={(advisor) => advisor.id}
          loading={isLoading}
          error={isError ? 'Could not load this list.' : undefined}
          onRetry={props.onRetry}
          emptyTitle={hasFilter ? 'No advisors match your filters.' : 'No active advisors.'}
          minWidth="780px"
          selection={{
            selectedIds,
            allSelected: allPageSelected,
            someSelected: pageIds.some((id) => selectedIds.has(id)),
            onToggleAll: () => props.onToggleAll(pageIds, allPageSelected),
            onToggleOne: props.onToggleOne,
            label: (advisor) => advisor.name,
          }}
        />
      </div>
      <Pagination page={page} pageSize={pageSize} total={advisorList.length} noun="advisors" onChange={props.onPageChange} />
    </div>
  );
}
