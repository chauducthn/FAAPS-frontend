// The cells that differ between the curriculum view and the cohort view.
// Shared by CurriculumTable so the table itself stays readable.

import { ArrowUpRight } from 'lucide-react';
import { cn } from '@/shared/lib/utils';
import { TableCell } from '../../../../shared/components/common/table/TablePrimitives';
import type { CurriculumItem } from '../../../academic/types/curriculum';

const MAJOR_TONES: Record<string, string> = {
  SE: 'bg-orange-100 text-[#9a3412]',
  IT: 'bg-blue-100 text-blue-800',
  CE: 'bg-violet-100 text-violet-800',
  BA: 'bg-emerald-100 text-emerald-800',
  DS: 'bg-cyan-100 text-cyan-800',
};

export const majorTone = (code: string) => MAJOR_TONES[code] ?? 'bg-gray-100 text-gray-700';

function MajorBadge({ item }: { item: CurriculumItem }) {
  return (
    <span className="flex items-center gap-2">
      <span
        className={cn(
          'flex size-7 items-center justify-center rounded-lg text-[11px] font-black',
          majorTone(item.majorCode),
        )}
      >
        {item.majorCode.slice(0, 2)}
      </span>
      <span className="whitespace-nowrap font-medium text-[var(--ink-muted)]">{item.majorName}</span>
    </span>
  );
}

/** Cells shown when the table lists cohorts. */
export function CohortCells({ item }: { item: CurriculumItem }) {
  return (
    <>
      <TableCell>
        <span
          className={cn(
            'inline-flex items-center rounded-lg bg-[#1f2937]',
            'px-2.5 py-1 font-mono text-[11px] font-bold',
            'text-white',
          )}
        >
          {item.version}
        </span>
      </TableCell>
      <TableCell>
        <MajorBadge item={item} />
      </TableCell>
      <TableCell className="max-w-[260px]">
        <span
          className="block truncate font-semibold text-[var(--ink-primary)]"
          title={item.name}
        >
          {item.name}
        </span>
      </TableCell>
      <TableCell>
        <span
          className={cn(
            'rounded-md bg-[var(--surface-sunken)] px-2 py-1',
            'font-mono text-[11px] font-semibold',
            'text-[var(--ink-secondary)]',
          )}
        >
          {item.effectiveFromSemesterCode}
        </span>
      </TableCell>
    </>
  );
}

/** Cells shown when the table lists curriculum versions. */
export function CurriculumCells({
  item,
  onOpen,
}: {
  item: CurriculumItem;
  onOpen: (item: CurriculumItem) => void;
}) {
  return (
    <>
      <TableCell>
        <button
          type="button"
          onClick={() => onOpen(item)}
          className={cn(
            'inline-flex items-center gap-1 rounded-lg',
            'bg-[var(--brand-soft)] px-2.5 py-1 font-mono',
            'text-[11px] font-bold text-[var(--brand-ink)] ring-1',
            'ring-orange-200 transition-colors',
            'hover:bg-[var(--brand)] hover:text-white',
          )}
          title={`Open ${item.majorCode} ${item.version}`}
        >
          {item.majorCode}_{item.version}
          <ArrowUpRight className="size-3 opacity-60" />
        </button>
      </TableCell>
      <TableCell className="max-w-[320px]">
        <button
          type="button"
          onClick={() => onOpen(item)}
          className="block max-w-full truncate text-left font-semibold hover:text-[var(--brand-ink)] hover:underline"
        >
          {item.name}
        </button>
        {item.isCurrent && (
          <span className="mt-1 inline-block rounded-full bg-orange-100 px-2 py-px text-[10px] font-bold text-[#9a3412]">
            Current version
          </span>
        )}
      </TableCell>
      <TableCell>
        <MajorBadge item={item} />
      </TableCell>
      <TableCell>
        <span
          className={cn(
            'rounded-md bg-orange-50 px-2.5 py-1 font-mono',
            'text-[11px] font-bold text-[#9a3412] ring-1',
            'ring-orange-200',
          )}
        >
          {item.version}
        </span>
      </TableCell>
    </>
  );
}
