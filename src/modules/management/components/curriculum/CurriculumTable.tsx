// Clean list table for Curriculum and Cohorts views.
import { StatusBadge } from '../StatusBadge';
import {
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TableShell,
} from '../../../../shared/components/common/table/TablePrimitives';
import { RowActionMenu, type RowAction } from '../RowActionMenu';
import { CohortCells, CurriculumCells } from './CurriculumTableCells';
import type { CurriculumItem } from '../../../academic/types/curriculum';
import type { CurriculumKind } from '../../../academic/hooks/queries/useCurriculumsQuery';

interface Props {
  kind: CurriculumKind;
  data: CurriculumItem[];
  onOpen: (item: CurriculumItem) => void;
  onEdit: (item: CurriculumItem) => void;
  onImportFor?: (item: CurriculumItem) => void;
  onToggleStatus: (item: CurriculumItem) => void;
  onDelete: (item: CurriculumItem) => void;
  selectedIds?: Set<string>;
  onSelect?: (id: string, selected: boolean) => void;
  onSelectPage?: (selected: boolean) => void;
}

export default function CurriculumTable({
  kind,
  data,
  onOpen,
  onEdit,
  onImportFor,
  onToggleStatus,
  onDelete,
  selectedIds,
  onSelect,
  onSelectPage,
}: Props) {
  const isCohort = kind === 'cohort';
  const canSelect = !isCohort && !!selectedIds && !!onSelect && !!onSelectPage;
  const selectedOnPage = data.filter((item) => selectedIds?.has(item.id)).length;

  return (
    <TableShell minWidth="820px">
      <thead>
        <tr>
          {canSelect && (
            <TableHead className="w-11">
              <input
                type="checkbox"
                aria-label="Select all curriculums on this page"
                checked={data.length > 0 && selectedOnPage === data.length}
                ref={(node) => {
                  if (node) node.indeterminate = selectedOnPage > 0 && selectedOnPage < data.length;
                }}
                onChange={(event) => onSelectPage(event.target.checked)}
                className="size-4 accent-[#F26F21]"
              />
            </TableHead>
          )}
          {isCohort ? (
            <>
              <TableHead>Cohort</TableHead>
              <TableHead>Major</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Start</TableHead>
            </>
          ) : (
            <>
              <TableHead>Curriculum</TableHead>
              <TableHead>Major</TableHead>
              <TableHead>Cohort</TableHead>
            </>
          )}
          <TableHead align="center">Courses</TableHead>
          <TableHead align="center">Credits</TableHead>
          <TableHead>Status</TableHead>
          {!isCohort && <TableHead>Start</TableHead>}
          <TableHead align="right">Actions</TableHead>
        </tr>
      </thead>
      <TableBody>
        {data.map((item) => {
          const active = item.status === 'ACTIVE';
          const actions: RowAction[] = [
            { label: isCohort ? 'View curriculum' : 'Open roadmap', onSelect: () => onOpen(item) },
            ...(onImportFor && !isCohort ? [{ label: 'Import Excel', onSelect: () => onImportFor(item) }] : []),
            { label: 'Edit details', onSelect: () => onEdit(item) },
            { label: active ? 'Archive (deactivate)' : 'Publish (activate)', onSelect: () => onToggleStatus(item) },
            { label: 'Delete', onSelect: () => onDelete(item), danger: true },
          ];
          return (
            <TableRow key={item.id} selected={selectedIds?.has(item.id)}>
              {canSelect && (
                <TableCell className="w-11">
                  <input
                    type="checkbox"
                    aria-label={`Select ${item.majorCode} ${item.version}`}
                    checked={selectedIds.has(item.id)}
                    onChange={(event) => onSelect(item.id, event.target.checked)}
                    className="size-4 accent-[#F26F21]"
                  />
                </TableCell>
              )}
              {isCohort ? <CohortCells item={item} /> : <CurriculumCells item={item} onOpen={onOpen} />}
              <TableCell align="center">
                <span className="inline-flex min-w-8 items-center justify-center rounded-md bg-gray-100 px-2 py-0.5 text-xs font-semibold tabular-nums text-gray-800">
                  {item.courseCount}
                </span>
              </TableCell>
              <TableCell align="center">
                <span className="font-mono text-[13px] font-semibold tabular-nums text-gray-900">
                  {item.totalCredits}
                </span>
                <span className="ml-1 text-xs text-gray-400">cr</span>
              </TableCell>
              <TableCell>
                <StatusBadge status={item.status} />
              </TableCell>
              {!isCohort && (
                <TableCell>
                  <span className="rounded-md bg-gray-100 px-2 py-0.5 font-mono text-xs font-medium text-gray-700">
                    {item.effectiveFromSemesterCode}
                  </span>
                </TableCell>
              )}
              <TableCell align="right">
                <RowActionMenu label={`Actions for ${item.majorCode} ${item.version}`} actions={actions} />
              </TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </TableShell>
  );
}
