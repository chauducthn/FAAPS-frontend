// Clean, de-duplicated cells for CurriculumTable (shared by Curriculum and Cohorts views).
import { cn } from '@/shared/lib/utils';
import { TableCell } from '../../../../shared/components/common/table/TablePrimitives';
import type { CurriculumItem } from '../../../academic/types/curriculum';

const MAJOR_TONES: Record<string, string> = {
  SE: 'text-brand-ink',
  IA: 'text-ink-secondary',
  AI: 'text-ink-secondary',
  IT: 'text-ink-secondary',
  CE: 'text-ink-secondary',
  BA: 'text-emerald-700',
  DS: 'text-ink-secondary',
};

export const majorTone = (code: string) => MAJOR_TONES[code] ?? 'text-ink-secondary';

function MajorBadge({ item }: { item: CurriculumItem }) {
  return (
    <span className={cn('text-[13px] font-semibold', majorTone(item.majorCode))} title={item.majorName}>
      {item.majorCode}
    </span>
  );
}

export function CohortCells({
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
          className="font-mono text-[13px] font-semibold text-ink-primary transition-colors hover:text-brand"
        >
          {item.version}
        </button>
      </TableCell>
      <TableCell>
        <MajorBadge item={item} />
      </TableCell>
      <TableCell className="max-w-[260px]">
        <button
          type="button"
          onClick={() => onOpen(item)}
          className="block max-w-full truncate text-left text-[13px] font-semibold text-ink-primary transition-colors hover:text-brand"
          title={item.majorName}
        >
          {item.majorName}
        </button>
      </TableCell>
      <TableCell>
        <span className="font-mono text-[13px] font-medium text-ink-secondary">
          {item.effectiveFromSemesterCode}
        </span>
      </TableCell>
      <TableCell>
        <span className={item.effectiveToSemesterCode ? 'font-mono text-[13px] font-medium text-ink-secondary' : 'text-xs text-ink-subtle'}>
          {item.effectiveToSemesterCode ?? '—'}
        </span>
      </TableCell>
    </>
  );
}

export function CurriculumCells({
  item,
  onOpen,
}: {
  item: CurriculumItem;
  onOpen: (item: CurriculumItem) => void;
}) {
  return (
    <>
      <TableCell className="max-w-[300px]">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => onOpen(item)}
            className="truncate text-left text-[13px] font-semibold text-ink-primary transition-colors hover:text-brand"
          >
            {item.name}
          </button>
          {item.isCurrent && (
            <span className="shrink-0 text-xs font-semibold text-brand-ink">
              Current
            </span>
          )}
        </div>
      </TableCell>
      <TableCell>
        <MajorBadge item={item} />
      </TableCell>
      <TableCell>
        <span className="font-mono text-[13px] font-semibold text-ink-primary">
          {item.version}
        </span>
      </TableCell>
    </>
  );
}
