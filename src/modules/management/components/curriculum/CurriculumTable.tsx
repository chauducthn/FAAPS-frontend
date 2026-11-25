// src/components/management/curriculum/CurriculumTable.tsx
// List table — FPT orange accent, sticky header, rich empty state handled by parent.
import { cn } from '@/shared/lib/utils';
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
    <TableShell minWidth="920px">
      <thead>
        <tr>
          {canSelect && (
            <TableHead className="w-12">
              <input
                type="checkbox"
                aria-label="Select all curriculums on this page"
                checked={data.length > 0 && selectedOnPage === data.length}
                ref={(node) => {
                  if (node) node.indeterminate = selectedOnPage > 0 && selectedOnPage < data.length;
                }}
                onChange={(event) => onSelectPage(event.target.checked)}
                className="size-4 accent-[var(--brand)]"
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
              <TableHead>Code</TableHead>
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
            { label: 'Edit details', onSelect: () => onEdit(item) },
            { label: active ? 'Archive (deactivate)' : 'Publish (activate)', onSelect: () => onToggleStatus(item) },
            { label: 'Delete', onSelect: () => onDelete(item), danger: true },
          ];
          return (
            <TableRow key={item.id} selected={selectedIds?.has(item.id)}>
              {canSelect && (
                <TableCell className="w-12">
                  <input
                    type="checkbox"
                    aria-label={`Select ${item.majorCode} ${item.version}`}
                    checked={selectedIds.has(item.id)}
                    onChange={(event) => onSelect(item.id, event.target.checked)}
                    className="size-4 accent-[var(--brand)]"
                  />
                </TableCell>
              )}
              {isCohort ? <CohortCells item={item} /> : <CurriculumCells item={item} onOpen={onOpen} />}
              <TableCell align="center">
                <span
                  className={cn(
                    'inline-flex min-w-9 items-center justify-center',
                    'rounded-full bg-[var(--surface-sunken)] px-2.5 py-1',
                    'text-[12px] font-bold tabular-nums',
                    'text-[var(--ink-primary)]',
                  )}
                >
                  {item.courseCount}
                </span>
              </TableCell>
              <TableCell align="center">
                <span className="font-mono text-[13px] font-bold tabular-nums text-[var(--ink-primary)]">
                  {item.totalCredits}
                </span>
                <span className="ml-1 text-[11px] text-[var(--ink-subtle)]">cr</span>
              </TableCell>
              <TableCell>
                <StatusBadge status={item.status} />
              </TableCell>
              {!isCohort && (
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
