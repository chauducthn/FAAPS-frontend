// Clean list table for Curriculum and Cohorts views with clickable column sorting.
import { useMemo, useState } from 'react';
import { CaretDown, CaretUp, CaretUpDown } from '@phosphor-icons/react';
import { cn } from '@/shared/lib/utils';
import { StatusBadge } from '../StatusBadge';
import { TableBody, TableCell, TableHead, TableRow, TableShell } from '../../../../shared/components/common/table/TablePrimitives';
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

type SortKey = 'version' | 'name' | 'majorCode' | 'majorName' | 'start' | 'end' | 'courseCount' | 'totalCredits' | 'status';

function valueOf(item: CurriculumItem, key: SortKey): string | number {
  switch (key) {
    case 'version': return item.version ?? '';
    case 'name': return item.name ?? '';
    case 'majorCode': return item.majorCode ?? '';
    case 'majorName': return item.majorName ?? '';
    case 'start': return item.effectiveFromSemesterCode ?? '';
    case 'end': return item.effectiveToSemesterCode ?? '';
    case 'courseCount': return item.courseCount;
    case 'totalCredits': return item.totalCredits;
    case 'status': return item.status;
  }
}

export default function CurriculumTable(p: Props) {
  const { kind, data, onOpen, onEdit, onImportFor, onToggleStatus, onDelete, selectedIds, onSelect, onSelectPage } = p;
  const [sort, setSort] = useState<{ key: SortKey; dir: 'asc' | 'desc' } | null>(null);
  const isCohort = kind === 'cohort';
  const canSelect = !!selectedIds && !!onSelect && !!onSelectPage;
  const selectedOnPage = data.filter((item) => selectedIds?.has(item.id)).length;

  const toggleSort = (key: SortKey) =>
    setSort((cur) => (!cur || cur.key !== key ? { key, dir: 'asc' } : cur.dir === 'asc' ? { key, dir: 'desc' } : null));

  const sortedData = useMemo(() => {
    if (!sort) return data;
    const factor = sort.dir === 'asc' ? 1 : -1;
    return [...data].sort((a, b) => {
      const av = valueOf(a, sort.key);
      const bv = valueOf(b, sort.key);
      if (typeof av === 'number' && typeof bv === 'number') return (av - bv) * factor;
      return String(av).localeCompare(String(bv), undefined, { numeric: true, sensitivity: 'base' }) * factor;
    });
  }, [data, sort]);

  const sortHead = (label: string, key: SortKey, align?: 'left' | 'center' | 'right') => {
    const dir = sort?.key === key ? sort.dir : null;
    return (
      <TableHead align={align}>
        <button
          type="button"
          onClick={() => toggleSort(key)}
          className={cn(
            'group inline-flex items-center gap-1 uppercase tracking-inherit transition-colors hover:text-gray-900',
            dir ? 'text-[#C2410C]' : 'text-inherit',
            align === 'center' && 'mx-auto',
          )}
        >
          <span>{label}</span>
          {dir === 'asc' ? (
            <CaretUp weight="fill" className="size-3 shrink-0 text-[#F26F21]" aria-hidden />
          ) : dir === 'desc' ? (
            <CaretDown weight="fill" className="size-3 shrink-0 text-[#F26F21]" aria-hidden />
          ) : (
            <CaretUpDown className="size-3 shrink-0 text-gray-400 opacity-60 transition-opacity group-hover:opacity-100" aria-hidden />
          )}
        </button>
      </TableHead>
    );
  };

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
              {sortHead('Cohort', 'version')}
              {sortHead('Major', 'majorCode')}
              {sortHead('Major name', 'majorName')}
              {sortHead('Start', 'start')}
              {sortHead('End', 'end')}
            </>
          ) : (
            <>
              {sortHead('Curriculum', 'name')}
              {sortHead('Major', 'majorCode')}
              {sortHead('Cohort', 'version')}
            </>
          )}
          {sortHead('Courses', 'courseCount', 'center')}
          {sortHead('Credits', 'totalCredits', 'center')}
          {sortHead('Status', 'status')}
          {!isCohort && (
            <>
              {sortHead('Start', 'start')}
              {sortHead('End', 'end')}
            </>
          )}
          <TableHead align="right">Actions</TableHead>
        </tr>
      </thead>
      <TableBody>
        {sortedData.map((item) => {
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
                <span className="text-[13px] font-semibold tabular-nums text-gray-800">{item.courseCount}</span>
              </TableCell>
              <TableCell align="center">
                <span className="font-mono text-[13px] font-semibold tabular-nums text-gray-900">
                  {item.majorTotalCredits && item.majorTotalCredits > 0 ? `${item.totalCredits} / ${item.majorTotalCredits}` : item.totalCredits}
                </span>
              </TableCell>
              <TableCell><StatusBadge status={item.status} /></TableCell>
              {!isCohort && (
                <>
                  <TableCell><span className="font-mono text-[13px] font-medium text-gray-700">{item.effectiveFromSemesterCode}</span></TableCell>
                  <TableCell><span className={item.effectiveToSemesterCode ? 'font-mono text-[13px] font-medium text-gray-700' : 'text-xs text-gray-400'}>{item.effectiveToSemesterCode ?? '—'}</span></TableCell>
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
