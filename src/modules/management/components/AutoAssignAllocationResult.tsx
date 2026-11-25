import { AlertTriangle, CheckCircle2 } from 'lucide-react';
import { StaticTable, type StaticColumn } from '@/shared/components/common/table/StaticTable';
import { LoadBadge } from './LoadBadge';
import type { CohortAutoAssignResponse, CohortPoolAdvisor } from '../types/admin';

interface Props {
  phase: 'preview' | 'done';
  response: CohortAutoAssignResponse;
  poolById: Map<string, CohortPoolAdvisor>;
}
type AllocationRow = CohortAutoAssignResponse['allocation'][number];

export function AutoAssignAllocationResult({ phase, response, poolById }: Props) {
  const columns: StaticColumn<AllocationRow>[] = [
    {
      key: 'advisor',
      header: 'Advisor',
      render: (row) => {
        const advisor = poolById.get(row.advisorId);
        return (
          <>
            <span className="font-semibold text-[var(--ink-primary)]">
              {advisor?.fullName ?? row.advisorId}
            </span>
            <span className="block text-xs font-normal text-[var(--ink-muted)]">{advisor?.email}</span>
          </>
        );
      },
    },
    {
      key: 'before',
      header: 'Total before',
      align: 'right',
      render: (row) => row.totalBefore,
    },
    {
      key: 'assigned',
      header: 'New students',
      align: 'right',
      render: (row) => (
        <span className="font-semibold text-[var(--brand)]">+{row.assigned}</span>
      ),
    },
    {
      key: 'after',
      header: 'Total after',
      align: 'right',
      render: (row) => {
        const advisor = poolById.get(row.advisorId);
        return <LoadBadge count={row.totalAfter} limit={advisor?.maxAdvisees ?? null} />;
      },
    },
  ];

  return (
    <>
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="rounded-lg bg-[var(--surface-page)] px-4 py-3">
          <p className="text-[11px] font-semibold uppercase tracking-[0.05em] text-[var(--ink-muted)]">
            {phase === 'done' ? 'Assigned' : 'New to assign'}
          </p>
          <p className="mt-1 text-2xl font-bold text-[var(--ink-primary)]">{response.assigned}</p>
        </div>
        <div className="rounded-lg bg-[var(--surface-page)] px-4 py-3">
          <p className="text-[11px] font-semibold uppercase tracking-[0.05em] text-[var(--ink-muted)]">
            Advisors used
          </p>
          <p className="mt-1 text-2xl font-bold text-[var(--ink-primary)]">
            {response.allocation.length}
          </p>
        </div>
      </div>
      <div className="overflow-x-auto rounded-lg border border-[var(--line)]">
        <StaticTable
          columns={columns}
          rows={response.allocation}
          rowKey={(row) => row.advisorId}
          minWidth="460px"
          emptyTitle="No advisor in the allocation"
          emptyDescription="Pick at least one advisor to preview the distribution."
        />
      </div>
      {response.warning && (
        <p className="flex items-start gap-2 rounded-lg bg-[#fffbeb] px-3 py-2 text-[13px] text-[#b45309]">
          <AlertTriangle className="mt-0.5 size-4 shrink-0" />
          At least one advisor ends up over the advisory limit. You can still continue; the limit is a warning, not a block.
        </p>
      )}
      {phase === 'preview' && response.assigned === 0 && (
        <p className="rounded-lg bg-[var(--surface-page)] px-3 py-2 text-[13px] text-[var(--ink-muted)]">
          There are no unassigned students in this cohort.
        </p>
      )}
      <ul className="flex flex-col gap-2 rounded-lg bg-[var(--surface-page)] p-4 text-[13px] text-[var(--ink-muted)]">
        {[
          'Only students without an advisor are distributed.',
         'The split balances the advisors’ total student counts.',
          'Existing assignments are never changed.',
        ].map((line) => (
          <li key={line} className="flex items-start gap-2">
            <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-[#047857]" />
            {line}
          </li>
        ))}
      </ul>
    </>
  );
}
