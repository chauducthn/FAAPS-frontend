// Clean, de-duplicated cells for CurriculumTable (shared by Curriculum and Cohorts views).
import { cn } from '@/shared/lib/utils';
import { TableCell } from '../../../../shared/components/common/table/TablePrimitives';
import type { CurriculumItem } from '../../../academic/types/curriculum';

const MAJOR_TONES: Record<string, string> = {
  SE: 'bg-orange-50 text-[#9a3412] ring-1 ring-inset ring-orange-200/80',
  IA: 'bg-blue-50 text-blue-700 ring-1 ring-inset ring-blue-200/80',
  AI: 'bg-violet-50 text-violet-700 ring-1 ring-inset ring-violet-200/80',
  IT: 'bg-sky-50 text-sky-700 ring-1 ring-inset ring-sky-200/80',
  CE: 'bg-indigo-50 text-indigo-700 ring-1 ring-inset ring-indigo-200/80',
  BA: 'bg-emerald-50 text-emerald-700 ring-1 ring-inset ring-emerald-200/80',
  DS: 'bg-cyan-50 text-cyan-700 ring-1 ring-inset ring-cyan-200/80',
};

export const majorTone = (code: string) => MAJOR_TONES[code] ?? 'bg-gray-100 text-gray-700';

function MajorBadge({ item }: { item: CurriculumItem }) {
  return (
    <span className="flex items-center gap-2">
      <span className={cn('inline-flex rounded-md px-2 py-0.5 text-xs font-semibold', majorTone(item.majorCode))}>
        {item.majorCode}
      </span>
      <span className="truncate text-[13px] text-gray-600">{item.majorName}</span>
    </span>
  );
}

export function CohortCells({ item }: { item: CurriculumItem }) {
  return (
    <>
      <TableCell>
        <span className="inline-flex rounded-md bg-gray-100 px-2 py-0.5 font-mono text-xs font-semibold text-gray-800">
          {item.version}
        </span>
      </TableCell>
      <TableCell>
        <MajorBadge item={item} />
      </TableCell>
      <TableCell className="max-w-[260px]">
        <span className="block truncate text-[13px] font-semibold text-gray-900" title={item.name}>
          {item.name}
        </span>
      </TableCell>
      <TableCell>
        <span className="rounded-md bg-gray-100 px-2 py-0.5 font-mono text-xs font-medium text-gray-700">
          {item.effectiveFromSemesterCode}
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
            <span className="shrink-0 rounded-full bg-orange-50 px-2 py-0.5 text-[11px] font-semibold text-[#C2410C] ring-1 ring-inset ring-orange-200/80">
              Current
            </span>
          )}
        </div>
      </TableCell>
      <TableCell>
        <MajorBadge item={item} />
      </TableCell>
      <TableCell>
        <span className="inline-flex rounded-md bg-gray-100 px-2 py-0.5 font-mono text-xs font-semibold text-gray-800">
          {item.version}
        </span>
      </TableCell>
    </>
  );
}
