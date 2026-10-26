// src/components/admin/curriculum/CurriculumTable.tsx
import type { CurriculumItem } from '../../../types/curriculum';
import { StatusBadge } from '../StatusBadge';
import { RowActionMenu, type RowAction } from '../RowActionMenu';
import type { CurriculumKind } from '../../../hooks/queries/useCurriculumsQuery';

interface Props {
  kind: CurriculumKind;
  data: CurriculumItem[];
  onOpen: (item: CurriculumItem) => void;
  onEdit: (item: CurriculumItem) => void;
  onToggleStatus: (item: CurriculumItem) => void;
  onDelete: (item: CurriculumItem) => void;
}

const th = 'px-4 py-3.5 text-[11px] font-semibold uppercase tracking-wide text-[#555f6f]';
const chip = 'inline-block rounded-md bg-[#e7eefe] px-2.5 py-1 text-[11px] font-semibold text-[#2b3a67]';

export default function CurriculumTable({ kind, data, onOpen, onEdit, onToggleStatus, onDelete }: Props) {
  const isCohort = kind === 'cohort';
  const columns = isCohort ? 7 : 8;

  return (
    <div className="overflow-hidden rounded-xl border border-gray-200/80 bg-white shadow-2xs">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[820px] border-collapse text-left">
          <thead>
            <tr className="border-b border-gray-100 bg-[#f4f7fe]">
              {isCohort ? (
                <>
                  <th className={th}>Cohort</th>
                  <th className={th}>Major</th>
                  <th className={th}>Name</th>
                  <th className={th}>Start date</th>
                </>
              ) : (
                <>
                  <th className={th}>Curriculum code</th>
                  <th className={th}>Name</th>
                  <th className={th}>Major</th>
                  <th className={th}>Cohort</th>
                </>
              )}
              <th className={`${th} text-center`}>Courses</th>
              <th className={th}>Status</th>
              {!isCohort && <th className={th}>Start date</th>}
              <th className={`${th} text-center`}>Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 text-[13px] text-[#151c27]">
            {data.length === 0 && (
              <tr>
                <td colSpan={columns} className="p-10 text-center text-sm text-[#555f6f]">
                  {isCohort ? 'No cohorts found.' : 'No curriculums found.'}
                </td>
              </tr>
            )}
            {data.map((item) => {
              const active = item.status === 'ACTIVE';
              const actions: RowAction[] = [
                { label: isCohort ? 'View curriculum' : 'Open courses', onSelect: () => onOpen(item) },
                { label: 'Edit', onSelect: () => onEdit(item) },
                { label: active ? 'Deactivate' : 'Activate', onSelect: () => onToggleStatus(item) },
                { label: 'Delete', onSelect: () => onDelete(item), danger: true },
              ];
              return (
                <tr key={item.id} className="transition-colors hover:bg-gray-50/60">
                  {isCohort ? (
                    <>
                      <td className="px-4 py-4">
                        <span className={chip}>{item.version}</span>
                      </td>
                      <td className="px-4 py-4 text-[#555f6f]">{item.majorCode} - {item.majorName}</td>
                      <td className="px-4 py-4 font-semibold">{item.name}</td>
                      <td className="px-4 py-4 text-[#555f6f]">{item.effectiveFromSemesterCode}</td>
                    </>
                  ) : (
                    <>
                      <td className="px-4 py-4">
                        <span className={chip}>{item.majorCode}_{item.version}</span>
                      </td>
                      <td className="px-4 py-4">
                        <button type="button" onClick={() => onOpen(item)} className="text-left font-semibold hover:underline">
                          {item.name}
                        </button>
                      </td>
                      <td className="px-4 py-4 text-[#555f6f]">{item.majorName}</td>
                      <td className="px-4 py-4">
                        <span className={chip}>{item.version}</span>
                      </td>
                    </>
                  )}
                  <td className="px-4 py-4 text-center">{item.courseCount}</td>
                  <td className="px-4 py-4">
                    <StatusBadge status={item.status} />
                  </td>
                  {!isCohort && <td className="px-4 py-4 text-[#555f6f]">{item.effectiveFromSemesterCode}</td>}
                  <td className="px-4 py-4 text-center">
                    <RowActionMenu label={`Actions for ${item.majorCode} ${item.version}`} actions={actions} />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
