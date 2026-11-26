// Clean, de-duplicated cells for CurriculumTable (shared by Curriculum and Cohorts views).
import { cn } from '@/shared/lib/utils';
import { TableCell } from '../../../../shared/components/common/table/TablePrimitives';
import type { CurriculumItem } from '../../../academic/types/curriculum';

const MAJOR_TONES: Record<string, string> = {
  SE: 'text-[#C2410C]',
  IA: 'text-blue-700',
  AI: 'text-violet-700',
  IT: 'text-sky-700',
  CE: 'text-indigo-700',
  BA: 'text-emerald-700',
  DS: 'text-cyan-700',
};

export const majorTone = (code: string) => MAJOR_TONES[code] ?? 'text-gray-700';

function MajorBadge({ item }: { item: CurriculumItem }) {
  return (
    <span className={cn('text-[13px] font-semibold', majorTone(item.majorCode))} title={item.majorName}>
      {item.majorCode}
    </span>
  );
}

export function CohortCells({ item }: { item: CurriculumItem }) {
  return (
    <>
      <TableCell>
        <span className="font-mono text-[13px] font-semibold text-gray-800">
          {item.version}
        </span>
      </TableCell>
      <TableCell>
        <MajorBadge item={item} />
      </TableCell>
      <TableCell className="max-w-[260px]">
        <span className="block truncate text-[13px] font-semibold text-gray-900" title={item.majorName}>
          {item.majorName}
        </span>
      </TableCell>
      <TableCell>
        <span className="font-mono text-[13px] font-medium text-gray-700">
          {item.effectiveFromSemesterCode}
        </span>
      </TableCell>
      <TableCell>
        <span className={item.effectiveToSemesterCode ? 'font-mono text-[13px] font-medium text-gray-700' : 'text-xs text-gray-400'}>
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
            className="truncate text-left text-[13px] font-semibold text-gray-900 transition-colors hover:text-[#F26F21]"
          >
            {item.name}
          </button>
          {item.isCurrent && (
            <span className="shrink-0 text-xs font-semibold text-[#C2410C]">
              Current
            </span>
          )}
        </div>
      </TableCell>
      <TableCell>
        <MajorBadge item={item} />
      </TableCell>
      <TableCell>
        <span className="font-mono text-[13px] font-semibold text-gray-800">
          {item.version}
        </span>
      </TableCell>
    </>
  );
}
