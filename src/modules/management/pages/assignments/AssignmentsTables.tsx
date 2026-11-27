import { Link } from 'react-router';
import { FolderPlus, MagnifyingGlassMinus, UserMinus, Users, X } from '@phosphor-icons/react';
import { EmptyState } from '../../../../shared/components/common/EmptyState';
import { LoadBadge } from '../../components/LoadBadge';
import { UserInitials } from '../../components/UserInitials';
import { Pagination } from '../../components/Pagination';
import { AdvisorRowMenu } from '../../components/AdvisorRowMenu';
import { StaticTable, type StaticColumn } from '../../../../shared/components/common/table/StaticTable';

export interface AdvisorRowItem {
  id: string;
  email: string;
  name: string;
  avatarUrl?: string | null;
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
  onSelectAllAdvisors: (ids: string[]) => void;
  onClearSelection: () => void;
  onBulkAssignCohorts: (advisors: { id: string; name: string }[]) => void;
  onBulkUnassignAdvisors: (advisors: { id: string; name: string }[]) => void;
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
      sortValue: (advisor) => advisor.name,
      render: (advisor) => (
        <button
          type="button"
          onClick={() => props.onOpenDetails(advisor.id)}
          title={`View students assigned to ${advisor.name}`}
          className="flex max-w-[220px] min-w-0 items-center gap-2.5 text-left transition-colors hover:text-brand-ink"
        >
          <UserInitials name={advisor.name} avatarUrl={advisor.avatarUrl} />
          <span className="truncate font-medium text-ink-primary hover:text-brand-ink hover:underline">{advisor.name}</span>
        </button>
      ),
    },
    {
      key: 'email',
      header: 'Email',
      sortValue: (advisor) => advisor.email,
      render: (advisor) => <span title={advisor.email} className="block max-w-[230px] truncate text-ink-muted">{advisor.email}</span>,
    },
    {
      key: 'load',
      header: 'Workload',
      sortValue: (advisor) => loadOf(advisor.id),
      render: (advisor) => <LoadBadge count={loadOf(advisor.id)} limit={advisor.limit} />,
    },
    {
      key: 'majors',
      header: 'Major',
      sortValue: (advisor) => [...new Set(advisor.chips.map((c) => c.majorCode).filter(Boolean))].join(', '),
      render: (advisor) => {
        const majorCodes = [...new Set(advisor.chips.map((c) => c.majorCode).filter(Boolean))];
        return majorCodes.length === 0 ? (
          <span className="text-ink-subtle">—</span>
        ) : (
          <span className="font-mono text-[12.5px] text-ink-secondary">{majorCodes.join(', ')}</span>
        );
      },
    },
    {
      key: 'cohorts',
      header: 'Cohort',
      sortValue: (advisor) => advisor.chips.map((c) => c.cohort).join(', '),
      render: (advisor) =>
        advisor.chips.length === 0 ? (
          <span className="text-ink-subtle">—</span>
        ) : (
          <div className="flex flex-wrap gap-1.5">
            {advisor.chips.map((chip) => (
              <Link
                key={chip.key}
                to={`/admin/assignments/cohorts/${chip.key}`}
                className="font-mono text-[12.5px] text-ink-secondary transition-colors hover:text-brand-ink hover:underline"
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

  if (!isLoading && !isError && advisorList.length === 0) {
    return (
      <EmptyState
        className="admin-fill justify-center"
        icon={hasFilter ? <MagnifyingGlassMinus aria-hidden /> : <Users aria-hidden />}
        title={hasFilter ? 'No advisors match your filters' : 'No active advisors yet'}
        description={hasFilter ? 'Try a different keyword or clear the active filters.' : 'Add advisor accounts in User Accounts to start assigning students.'}
      />
    );
  }

  return (
    <div className="flex admin-fill flex-col">
      <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
        {selectedIds.size > 0 && (
          <div role="region" aria-label="Advisor bulk actions" className="flex shrink-0 flex-wrap items-center justify-between gap-2.5 border-b border-brand/25 bg-brand-soft/70 px-4 py-2.5">
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-sm bg-brand px-2 py-0.5 text-xs font-semibold tabular-nums text-white">
                {selectedIds.size} advisor{selectedIds.size === 1 ? '' : 's'} selected
              </span>
              {selectedIds.size < advisorList.length && (
                <button
                  type="button"
                  onClick={() => props.onSelectAllAdvisors(advisorList.map((a) => a.id))}
                  className="rounded-md border border-brand/30 bg-white px-2 py-1 text-xs font-semibold text-brand-ink transition-colors hover:bg-brand-soft-strong/70"
                >
                  Select all {advisorList.length}
                </button>
              )}
              <button type="button" onClick={props.onClearSelection} className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium text-ink-muted hover:bg-brand-soft-strong/80 hover:text-ink-primary">
                <X className="size-3.5" aria-hidden /> Clear
              </button>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => props.onBulkUnassignAdvisors(selectedAdvisors)}
                className="inline-flex h-8 items-center gap-1.5 rounded-md bg-red-50 px-3 text-[13px] font-medium text-red-700 transition-colors hover:bg-red-100"
              >
                <UserMinus className="size-3.5" aria-hidden /> Unassign
              </button>
              <button
                type="button"
                onClick={() => props.onBulkAssignCohorts(selectedAdvisors)}
                className="inline-flex h-8 items-center gap-1.5 rounded-md bg-white px-3 text-[13px] font-medium text-ink-primary ring-1 ring-line transition-colors hover:bg-surface-hover"
              >
                <FolderPlus className="size-3.5" aria-hidden /> Assign cohort
              </button>
            </div>
          </div>
        )}
        <StaticTable
          stickyHeader className="min-h-0 flex-1 overflow-auto"
          columns={columns} rows={rows} rowKey={(advisor) => advisor.id}
          loading={isLoading} error={isError ? 'Could not load this list.' : undefined}
          onRetry={props.onRetry} minWidth="780px"
          emptyTitle={hasFilter ? 'No advisors match your filters.' : 'No active advisors.'}
          selection={{
            selectedIds, allSelected: allPageSelected,
            someSelected: pageIds.some((id) => selectedIds.has(id)),
            onToggleAll: () => props.onToggleAll(pageIds, allPageSelected),
            onToggleOne: props.onToggleOne, label: (advisor) => advisor.name,
          }}
        />
      </div>
      <Pagination page={page} pageSize={pageSize} total={advisorList.length} noun="advisors" onChange={props.onPageChange} />
    </div>
  );
}
