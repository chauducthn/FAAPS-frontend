import { Clock } from '@phosphor-icons/react';
import { EmptyState } from '@/shared/components/common/EmptyState';
import { RowActionMenu } from '../../components/RowActionMenu';
import { StatusBadge } from '../../components/StatusBadge';
import type { AcademicBlockItem } from '../../services/academic-block.service';

const TYPE_BADGE: Record<string, string> = {
  PREP: 'bg-line-soft text-ink-secondary ring-line',
  MAIN: 'bg-brand-soft text-brand-ink ring-brand/30',
  FAST: 'bg-line-soft text-ink-secondary ring-line',
  INTENSIVE: 'bg-amber-50 text-amber-800 ring-amber-200',
};

interface Props {
  blocks: AcademicBlockItem[];
  isLoading: boolean;
  isDeleting: boolean;
  onEdit: (block: AcademicBlockItem) => void;
  onDelete: (id: string) => void;
}

export function AcademicBlocksTable({ blocks, isLoading, isDeleting, onEdit, onDelete }: Props) {
  return (
    <section className="flex flex-col overflow-hidden rounded-lg border border-line bg-white shadow-2xs">
      <div className="flex shrink-0 items-center justify-between gap-3 border-b border-line-soft px-4 py-3">
        <div className="flex items-center gap-3">
          <span className="flex size-9 shrink-0 items-center justify-center rounded-md bg-surface-page text-ink-secondary ring-1 ring-inset ring-line">
            <Clock className="size-[18px]" aria-hidden />
          </span>
          <div>
            <h2 className="text-sm font-semibold text-ink-primary">
              Study Blocks{' '}
              <span className="font-mono text-xs text-ink-muted tabular-nums">({blocks.length})</span>
            </h2>
            <p className="text-xs text-ink-muted">
              Configure FPTU block durations (weeks), max courses, and max credits.
            </p>
          </div>
        </div>
      </div>

      <div className="admin-fill overflow-auto">
        {!isLoading && blocks.length === 0 ? (
          <EmptyState
            className="h-full justify-center"
            icon={<Clock aria-hidden />}
            title="No study blocks yet"
            description="Use Add block above to configure semester block durations and limits."
          />
        ) : (
        <table className="w-full border-collapse text-left">
          <thead className="sticky top-0 z-10 bg-surface-page">
            <tr className="border-b border-line-soft text-[11px] font-semibold uppercase tracking-wide text-ink-muted">
              <th className="py-2.5 pl-4 pr-3">Code</th>
              <th className="px-3 py-2.5">Block Name</th>
              <th className="px-3 py-2.5">Type</th>
              <th className="px-3 py-2.5 text-center">Duration</th>
              <th className="px-3 py-2.5 text-center">Max Courses</th>
              <th className="px-3 py-2.5 text-center">Max Credits</th>
              <th className="px-3 py-2.5">Status</th>
              <th className="py-2.5 pl-3 pr-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line-soft text-[13px]">
            {isLoading ? (
              <tr>
                <td colSpan={8} className="py-8 text-center text-xs text-ink-subtle">
                  Loading blocks…
                </td>
              </tr>
            ) : (
              blocks.map((b) => {
                const badgeCls = TYPE_BADGE[b.blockType] ?? 'bg-line-soft text-ink-secondary ring-line';
                return (
                  <tr key={b.id} className="hover:bg-surface-hover/70">
                    <td className="py-3 pl-4 pr-3 font-mono text-xs font-semibold text-ink-primary">{b.code}</td>
                    <td className="px-3 py-3">
                      <p className="font-semibold text-ink-primary">{b.name}</p>
                      {b.description && <p className="text-[11px] text-ink-muted">{b.description}</p>}
                    </td>
                    <td className="px-3 py-3">
                      <span className={`inline-flex rounded-sm px-2 py-0.5 text-[11px] font-semibold ring-1 ring-inset ${badgeCls}`}>
                        {b.blockType}
                      </span>
                    </td>
                    <td className="px-3 py-3 text-center font-mono text-xs font-semibold tabular-nums text-ink-primary">
                      {b.durationWeeks}w
                    </td>
                    <td className="px-3 py-3 text-center font-mono text-xs font-semibold tabular-nums text-ink-primary">
                      {b.maxCourses}
                    </td>
                    <td className="px-3 py-3 text-center font-mono text-xs font-semibold tabular-nums text-ink-primary">
                      {b.maxCredits} cr
                    </td>
                    <td className="px-3 py-3">
                      <StatusBadge status={b.active ? 'ACTIVE' : 'INACTIVE'} />
                    </td>
                    <td className="py-3 pl-3 pr-4 text-right">
                      <RowActionMenu
                        label={`Actions for ${b.code}`}
                        actions={[
                          { label: 'Edit block', onSelect: () => onEdit(b) },
                          { label: 'Delete block', danger: true, disabled: isDeleting, onSelect: () => onDelete(b.id) },
                        ]}
                      />
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
        )}
      </div>
    </section>
  );
}
