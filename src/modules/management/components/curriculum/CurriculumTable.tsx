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
  const canSelect = !!selectedIds && !!onSelect && !!onSelectPage;
  const selectedOnPage = data.filter((item) => selectedIds?.has(item.id)).length;

  return (
    <TableShell stickyHeader minWidth="820px" className="min-h-0 flex-1 overflow-auto">
      <thead>
        <tr>
          {canSelect && (
            <TableHead className="w-11">
              <input
                type="checkbox"
                aria-label={`Select all ${isCohort ? 'cohorts' : 'curriculums'} on this page`}
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
              <TableHead>Major name</TableHead>
              <TableHead>Start</TableHead>
              <TableHead>End</TableHead>
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
          {!isCohort && (
            <>
              <TableHead>Start</TableHead>
              <TableHead>End</TableHead>
            </>
          )}
          <TableHead align="right">Actions</TableHead>
        </tr>
      </thead>
      <TableBody>
        {data.map((item) => {
          const active = item.status === 'ACTIVE';
          const actions: RowAction[] = [
            { label: isCohort ? 'Manage courses' : 'Open roadmap', onSelect: () => onOpen(item) },
            ...(onImportFor && !isCohort ? [{ label: 'Import Excel', onSelect: () => onImportFor(item) }] : []),
            { label: 'Edit details', onSelect: () => onEdit(item) },
            { label: active ? 'Deactivate' : 'Activate', onSelect: () => onToggleStatus(item) },
            { label: 'Delete', onSelect: () => onDelete(item), danger: true },
          ];
          return (
            <TableRow
              key={item.id}
              selected={selectedIds?.has(item.id)}
              onDoubleClick={isCohort ? () => onOpen(item) : undefined}
              className={isCohort ? 'cursor-pointer' : undefined}
            >
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
              {isCohort ? <CohortCells item={item} onOpen={onOpen} /> : <CurriculumCells item={item} onOpen={onOpen} />}
              <TableCell align="center">
                <span className="text-[13px] font-semibold tabular-nums text-gray-800">
                  {item.courseCount}
                </span>
              </TableCell>
              <TableCell align="center">
                <span className="font-mono text-[13px] font-semibold tabular-nums text-gray-900">
                  {item.majorTotalCredits && item.majorTotalCredits > 0
                    ? `${item.totalCredits} / ${item.majorTotalCredits}`
                    : item.totalCredits}
                </span>
              </TableCell>
              <TableCell>
                <StatusBadge status={item.status} />
              </TableCell>
              {!isCohort && (
                <>
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
