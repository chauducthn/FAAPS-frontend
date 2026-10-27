// src/components/management/courses/CourseTable.tsx
import type { CourseSummary } from '../../../types/course';
import { StatusBadge } from '../StatusBadge';
import { RowActionMenu } from '../RowActionMenu';

interface Props {
  data: CourseSummary[];
  selectedIds: string[];
  onSelectAll: (checked: boolean) => void;
  onSelectRow: (id: string) => void;
  onView: (c: CourseSummary) => void;
  onEdit: (c: CourseSummary) => void;
  onDelete: (c: CourseSummary) => void;
}

export default function CourseTable({
  data,
  selectedIds,
  onSelectAll,
  onSelectRow,
  onView,
  onEdit,
  onDelete,
}: Props) {
  const allSelected = data.length > 0 && selectedIds.length === data.length;

  return (
    <div className="bg-white rounded-xl border border-gray-200/80 shadow-2xs overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-indigo-50/30 border-b border-gray-100 text-[10px] font-bold text-gray-500 uppercase tracking-wider">
              <th className="p-4 w-10 text-center">
                <input
                  type="checkbox"
                  checked={allSelected}
                  onChange={(e) => onSelectAll(e.target.checked)}
                  className="rounded border-gray-300 text-[#F26F21]"
                />
              </th>
              <th className="p-4">Code</th>
              <th className="p-4">Name</th>
              <th className="p-4 text-center">Credits</th>
              <th className="p-4">Category</th>
              <th className="p-4 text-center">Prereq</th>
              <th className="p-4 text-center">In Curriculums</th>
              <th className="p-4">Status</th>
              <th className="p-4 w-20 text-center">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 text-xs font-medium text-gray-800">
            {data.length === 0 && (
              <tr>
                <td colSpan={9} className="p-8 text-center text-xs text-gray-500">
                  No courses yet. Create the first course to start building curricula.
                </td>
              </tr>
            )}
            {data.map((c) => {
              const isSelected = selectedIds.includes(c.id);
              return (
                <tr
                  key={c.id}
                  className={`hover:bg-gray-50/60 transition-colors ${
                    isSelected ? 'bg-orange-50/20' : ''
                  }`}
                >
                  <td className="p-4 text-center">
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => onSelectRow(c.id)}
                      className="rounded border-gray-300 text-[#F26F21]"
                    />
                  </td>
                  <td className="p-4 font-bold text-gray-900">{c.code}</td>
                  <td className="p-4">
                    <button
                      onClick={() => onView(c)}
                      className="text-left hover:underline font-semibold text-gray-900"
                    >
                      {c.name}
                    </button>
                  </td>
                  <td className="p-4 text-center">{c.credits}</td>
                  <td className="p-4 text-gray-600">
                    {c.categoryCode} - {c.categoryName}
                  </td>
                  <td className="p-4 text-center">{c.prerequisiteCount}</td>
                  <td className="p-4 text-center">{c.usedInCurriculumCount}</td>
                  <td className="p-4">
                    <StatusBadge status={c.status} />
                  </td>
                  <td className="p-4 text-center">
                    <RowActionMenu
                      label={`Actions for ${c.code}`}
                      actions={[
                        { label: 'View detail', onSelect: () => onView(c) },
                        { label: 'Edit course', onSelect: () => onEdit(c) },
                        { label: 'Delete course', onSelect: () => onDelete(c), danger: true },
                      ]}
                    />
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
