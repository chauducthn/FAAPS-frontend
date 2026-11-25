import { AlertTriangle, CheckCircle2 } from 'lucide-react';
import { LoadBadge } from './LoadBadge';
import type { CohortAutoAssignResponse, CohortPoolAdvisor } from '../types/admin';

interface Props {
  phase: 'preview' | 'done';
  response: CohortAutoAssignResponse;
  poolById: Map<string, CohortPoolAdvisor>;
}

export function AutoAssignAllocationResult({ phase, response, poolById }: Props) {
  return (
    <>
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="rounded-lg bg-[#f7f8fa] px-4 py-3">
          <p className="text-[11px] font-semibold uppercase tracking-[0.05em] text-[#555f6f]">
            {phase === 'done' ? 'Assigned' : 'New to assign'}
          </p>
          <p className="mt-1 text-2xl font-bold text-[#151c27]">{response.assigned}</p>
        </div>
        <div className="rounded-lg bg-[#f7f8fa] px-4 py-3">
          <p className="text-[11px] font-semibold uppercase tracking-[0.05em] text-[#555f6f]">Advisors used</p>
          <p className="mt-1 text-2xl font-bold text-[#151c27]">{response.allocation.length}</p>
        </div>
      </div>
      <div className="overflow-x-auto rounded-lg border border-[#e7eefe]">
        <table className="w-full min-w-[460px] text-left text-sm">
          <thead className="bg-[rgba(240,243,255,0.7)] text-[#555f6f]">
            <tr>
              <th className="px-4 py-3 font-medium">Advisor</th>
              <th className="px-4 py-3 font-medium">Total before</th>
              <th className="px-4 py-3 font-medium">New students</th>
              <th className="px-4 py-3 font-medium">Total after</th>
            </tr>
          </thead>
          <tbody>
            {response.allocation.map((row) => {
              const advisor = poolById.get(row.advisorId);
              return (
                <tr key={row.advisorId} className="border-t border-[#e7eefe]">
                  <td className="px-4 py-3 font-semibold text-[#151c27]">
                    {advisor?.fullName ?? row.advisorId}
                    <span className="block text-xs font-normal text-[#555f6f]">{advisor?.email}</span>
                  </td>
                  <td className="px-4 py-3 text-[#151c27]">{row.totalBefore}</td>
                  <td className="px-4 py-3 font-semibold text-[#f37021]">+{row.assigned}</td>
                  <td className="px-4 py-3">
                    <LoadBadge count={row.totalAfter} limit={advisor?.maxAdvisees ?? null} />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      {response.warning && (
        <p className="flex items-start gap-2 rounded-lg bg-[#fffbeb] px-3 py-2 text-[13px] text-[#b45309]">
          <AlertTriangle className="mt-0.5 size-4 shrink-0" />
          At least one advisor ends up over the advisory limit. You can still continue; the limit is a warning, not a block.
        </p>
      )}
      {phase === 'preview' && response.assigned === 0 && (
        <p className="rounded-lg bg-[#f7f8fa] px-3 py-2 text-[13px] text-[#555f6f]">
          There are no unassigned students in this cohort.
        </p>
      )}
      <ul className="flex flex-col gap-2 rounded-lg bg-[#f7f8fa] p-4 text-[13px] text-[#555f6f]">
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
