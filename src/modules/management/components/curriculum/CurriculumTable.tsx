// src/components/management/curriculum/CurriculumTable.tsx
// List table — FPT orange accent, sticky header, rich empty state handled by parent.
import { ArrowUpRight } from 'lucide-react';
import { cn } from '@/shared/lib/utils';
import { StatusBadge } from '../StatusBadge';
import { RowActionMenu, type RowAction } from '../RowActionMenu';
import type { CurriculumItem } from '../../../academic/types/curriculum';
import type { CurriculumKind } from '../../../academic/hooks/queries/useCurriculumsQuery';

interface Props {
  kind: CurriculumKind;
  data: CurriculumItem[];
  onOpen: (item: CurriculumItem) => void;
  onEdit: (item: CurriculumItem) => void;
  onToggleStatus: (item: CurriculumItem) => void;
  onDelete: (item: CurriculumItem) => void;
}

const th = 'px-4 py-3 text-[11px] font-bold uppercase tracking-[0.06em] text-gray-500 whitespace-nowrap';

const MAJOR_TONES: Record<string, string> = {
  SE: 'bg-orange-100 text-[#9a3412]',
  IT: 'bg-blue-100 text-blue-800',
  CE: 'bg-violet-100 text-violet-800',
  BA: 'bg-emerald-100 text-emerald-800',
  DS: 'bg-cyan-100 text-cyan-800',
};
const majorTone = (code: string) => MAJOR_TONES[code] ?? 'bg-gray-100 text-gray-700';

export default function CurriculumTable({ kind, data, onOpen, onEdit, onToggleStatus, onDelete }: Props) {
  const isCohort = kind === 'cohort';

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[860px] border-collapse text-left" role="table">
        <thead className="sticky top-0 z-10">
          <tr className="border-b border-gray-100 bg-[#fafbfd]">
            {isCohort ? (
              <>
                <th className={th}>Cohort</th>
                <th className={th}>Major</th>
                <th className={th}>Name</th>
                <th className={th}>Start</th>
              </>
            ) : (
              <>
                <th className={th}>Code</th>
                <th className={th}>Curriculum</th>
                <th className={th}>Major</th>
                <th className={th}>Cohort</th>
              </>
            )}
            <th className={cn(th, 'text-center')}>Courses</th>
            <th className={cn(th, 'text-center')}>Credits</th>
            <th className={th}>Status</th>
            {!isCohort && <th className={th}>Start</th>}
            <th className={cn(th, 'text-right')}>Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100 text-[13px] text-gray-900">
          {data.map((item) => {
            const active = item.status === 'ACTIVE';
            const actions: RowAction[] = [
              { label: isCohort ? 'View curriculum' : 'Open roadmap', onSelect: () => onOpen(item) },
              { label: 'Edit details', onSelect: () => onEdit(item) },
              { label: active ? 'Archive (deactivate)' : 'Publish (activate)', onSelect: () => onToggleStatus(item) },
              { label: 'Delete', onSelect: () => onDelete(item), danger: true },
            ];
            return (
              <tr key={item.id} className="group transition-colors hover:bg-[#fff7ed]/60">
                {isCohort ? (
                  <>
                    <td className="px-4 py-3.5">
                      <span className="inline-flex items-center rounded-lg bg-[#1f2937] px-2.5 py-1 font-mono text-[11px] font-bold text-white">
                        {item.version}
                      </span>
                    </td>
                    <td className="px-4 py-3.5">
                      <span className="flex items-center gap-2">
                        <span className={cn('flex size-7 items-center justify-center rounded-lg text-[11px] font-black', majorTone(item.majorCode))}>
                          {item.majorCode.slice(0, 2)}
                        </span>
                        <span className="font-medium text-gray-600">{item.majorName}</span>
                      </span>
                    </td>
                    <td className="max-w-[260px] truncate px-4 py-3.5 font-semibold" title={item.name}>{item.name}</td>
                    <td className="px-4 py-3.5">
                      <span className="rounded-md bg-gray-100 px-2 py-1 font-mono text-[11px] font-semibold text-gray-700">
                        {item.effectiveFromSemesterCode}
                      </span>
                    </td>
                  </>
                ) : (
                  <>
                    <td className="px-4 py-3.5">
                      <button
                        type="button"
                        onClick={() => onOpen(item)}
                        className="inline-flex items-center gap-1 rounded-lg bg-gray-900 px-2.5 py-1 font-mono text-[11px] font-bold text-white transition-colors hover:bg-[#F26F21]"
                        title={`Open ${item.majorCode} ${item.version}`}
                      >
                        {item.majorCode}_{item.version}
                        <ArrowUpRight className="size-3 opacity-60" />
                      </button>
                    </td>
                    <td className="max-w-[280px] px-4 py-3.5">
                      <button type="button" onClick={() => onOpen(item)} className="block max-w-full truncate text-left font-semibold hover:text-[#C2410C] hover:underline">
                        {item.name}
                      </button>
                      {item.isCurrent && (
                        <span className="mt-1 inline-block rounded-full bg-orange-100 px-2 py-px text-[10px] font-bold text-[#9a3412]">
                          Current version
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3.5">
                      <span className="flex items-center gap-2">
                        <span className={cn('flex size-7 items-center justify-center rounded-lg text-[11px] font-black', majorTone(item.majorCode))}>
                          {item.majorCode.slice(0, 2)}
                        </span>
                        <span className="whitespace-nowrap font-medium text-gray-600">{item.majorName}</span>
                      </span>
                    </td>
                    <td className="px-4 py-3.5">
                      <span className="rounded-md bg-orange-50 px-2.5 py-1 font-mono text-[11px] font-bold text-[#9a3412] ring-1 ring-orange-200">
                        {item.version}
                      </span>
                    </td>
                  </>
                )}
                <td className="px-4 py-3.5 text-center">
                  <span className="inline-flex min-w-9 items-center justify-center rounded-full bg-gray-100 px-2.5 py-1 text-[12px] font-bold tabular-nums text-gray-800">
                    {item.courseCount}
                  </span>
                </td>
                <td className="px-4 py-3.5 text-center">
                  <span className="font-mono text-[13px] font-bold tabular-nums text-gray-900">{item.totalCredits}</span>
                  <span className="ml-1 text-[11px] text-gray-400">cr</span>
                </td>
                <td className="px-4 py-3.5">
                  <StatusBadge status={item.status} />
                </td>
                {!isCohort && (
                  <td className="px-4 py-3.5">
                    <span className="rounded-md bg-gray-100 px-2 py-1 font-mono text-[11px] font-semibold text-gray-700">
                      {item.effectiveFromSemesterCode}
                    </span>
                  </td>
                )}
                <td className="px-4 py-3.5 text-right">
                  <RowActionMenu label={`Actions for ${item.majorCode} ${item.version}`} actions={actions} />
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
