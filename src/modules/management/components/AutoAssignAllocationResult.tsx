import { Warning as AlertTriangle, ShieldWarning as ShieldAlert } from '@phosphor-icons/react';
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
  const remaining = response.unassignedRemaining ?? 0;
  const atRiskTotal = response.atRiskAssigned ?? 0;

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
      header: 'Before',
      align: 'right',
      render: (row) => <span className="tabular-nums">{row.totalBefore}</span>,
    },
    {
      key: 'assigned',
      header: 'New',
      align: 'right',
      render: (row) => (
        <div className="inline-flex items-center justify-end gap-1.5">
          <span className="font-semibold tabular-nums text-[var(--brand)]">+{row.assigned}</span>
          {(row.atRiskAssigned ?? 0) > 0 && (
            <span
              title="High-risk students balanced to this advisor"
              className="inline-flex items-center gap-0.5 rounded-full bg-rose-50 px-1.5 py-0.5 text-[10px] font-semibold text-rose-700 ring-1 ring-inset ring-rose-200/80"
            >
              <ShieldAlert className="size-2.5" />
              {row.atRiskAssigned}
            </span>
          )}
        </div>
      ),
    },
    {
      key: 'after',
      header: 'After / Capacity',
      align: 'right',
      render: (row) => {
        const advisor = poolById.get(row.advisorId);
        const limit = row.maxAdvisees ?? advisor?.maxAdvisees ?? null;
        const pct = row.utilizationPct ?? (limit && limit > 0 ? Math.round((row.totalAfter * 100) / limit) : null);
        return (
          <div className="inline-flex flex-col items-end gap-1">
            <LoadBadge count={row.totalAfter} limit={limit} />
            {pct !== null && (
              <div className="flex items-center gap-1.5">
                <div className="h-1.5 w-14 overflow-hidden rounded-full bg-gray-100">
                  <div
                    className={`h-full rounded-full ${pct > 100 ? 'bg-red-500' : pct >= 85 ? 'bg-amber-500' : 'bg-emerald-500'}`}
                    style={{ width: `${Math.min(100, pct)}%` }}
                  />
                </div>
                <span className="text-[11px] tabular-nums text-gray-500">{pct}%</span>
              </div>
            )}
          </div>
        );
      },
    },
  ];

  return (
    <div className="space-y-3">
      <div className="grid gap-2.5 sm:grid-cols-3">
        <div className="rounded-lg bg-[var(--surface-page)] px-3.5 py-2.5">
          <p className="text-[11px] font-semibold uppercase tracking-[0.05em] text-[var(--ink-muted)]">
            {phase === 'done' ? 'Assigned' : 'Will assign'}
          </p>
          <p className="mt-0.5 text-xl font-bold tabular-nums text-[var(--ink-primary)]">{response.assigned}</p>
        </div>
        <div className="rounded-lg bg-[var(--surface-page)] px-3.5 py-2.5">
          <p className="text-[11px] font-semibold uppercase tracking-[0.05em] text-[var(--ink-muted)]">
            At-Risk balanced
          </p>
          <p className="mt-0.5 text-xl font-bold tabular-nums text-rose-700">{atRiskTotal}</p>
        </div>
        <div className="rounded-lg bg-[var(--surface-page)] px-3.5 py-2.5">
          <p className="text-[11px] font-semibold uppercase tracking-[0.05em] text-[var(--ink-muted)]">
            {remaining > 0 ? 'Unassigned left' : 'Advisors used'}
          </p>
          <p className={`mt-0.5 text-xl font-bold tabular-nums ${remaining > 0 ? 'text-amber-700' : 'text-[var(--ink-primary)]'}`}>
            {remaining > 0 ? remaining : response.allocation.length}
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
          emptyDescription="Select at least one advisor to preview the distribution."
        />
      </div>

      {remaining > 0 && (
        <p className="flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-800">
          <AlertTriangle className="mt-0.5 size-4 shrink-0 text-amber-600" />
          <span>
            <strong>{remaining}</strong> student{remaining === 1 ? '' : 's'} will remain unassigned because selected
            advisors reached their max advisee limit. Add available advisors above or enable{' '}
            <strong>Allow exceeding max advisees</strong>.
          </span>
        </p>
      )}

      {response.warning && (
        <p className="flex items-start gap-2 rounded-lg bg-[#fffbeb] px-3 py-2 text-xs text-[#b45309]">
          <AlertTriangle className="mt-0.5 size-4 shrink-0" />
          At least one advisor exceeds their max advisee limit (overflow mode enabled).
        </p>
      )}

      {phase === 'preview' && response.assigned === 0 && remaining === 0 && (
        <p className="rounded-lg bg-[var(--surface-page)] px-3 py-2 text-xs text-[var(--ink-muted)]">
          There are no unassigned students in this cohort.
        </p>
      )}
    </div>
  );
}
