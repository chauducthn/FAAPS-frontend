// src/components/admin/curriculum/CurriculumList.tsx
// List view with selection + bulk actions.

import { useState } from 'react';
import { MoreHorizontal } from 'lucide-react';
import type { CurriculumSummary } from '../../../types/curriculum';
import { StatusBadge } from '../../admin/StatusBadge';

interface Props {
  data: CurriculumSummary[];
  selectedIds: string[];
  onSelectAll: (checked: boolean) => void;
  onSelectRow: (id: string) => void;
  onEdit: (c: CurriculumSummary) => void;
  onDelete: (c: CurriculumSummary) => void;
  onPublish: (c: CurriculumSummary) => void;
  onArchive: (c: CurriculumSummary) => void;
  onOpenDetail: (c: CurriculumSummary) => void;
}


export default function CurriculumList({
  data,
  selectedIds,
  onSelectAll,
  onSelectRow,
  onEdit,
  onDelete,
  onPublish,
  onArchive,
  onOpenDetail,
}: Props) {
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);
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
              <th className="p-4">Version</th>
              <th className="p-4">Name</th>
              <th className="p-4">Major</th>
              <th className="p-4 text-center">Courses</th>
              <th className="p-4 text-center">Credits</th>
              <th className="p-4">Effective</th>
              <th className="p-4">Status</th>
              <th className="p-4 w-20 text-center">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 text-xs font-medium text-gray-800">
            {data.length === 0 && (
              <tr>
                <td colSpan={9} className="p-8 text-center text-xs text-gray-500">
                  No curriculum yet. Create the first one to attach courses per semester.
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
                  <td className="p-4 font-bold text-gray-900">{c.version}</td>
                  <td className="p-4">
                    <button
                      onClick={() => onOpenDetail(c)}
                      className="text-left hover:underline font-semibold text-gray-900"
                    >
                      {c.name}
                    </button>
                  </td>
                  <td className="p-4 text-gray-600">
                    {c.majorCode} - {c.majorName}
                  </td>
                  <td className="p-4 text-center">{c.totalCourses}</td>
                  <td className="p-4 text-center">{c.totalCredits}</td>
                  <td className="p-4 text-gray-600">
                    {c.effectiveFromSemesterCode}
                    {c.effectiveToSemesterCode ? ` → ${c.effectiveToSemesterCode}` : ' → ...'}
                  </td>
                  <td className="p-4">
                    <StatusBadge status={c.status} />
                    {c.isCurrent && (
                      <span className="ml-1 text-[10px] font-bold text-[#F26F21]">· CURRENT</span>
                    )}
                  </td>
                  <td className="p-4 text-center relative">
                    <button
                      onClick={() => setActiveMenuId(activeMenuId === c.id ? null : c.id)}
                      className="p-1 text-gray-400 hover:text-gray-700 rounded-md hover:bg-gray-100"
                    >
                      <MoreHorizontal className="size-4" />
                    </button>
                    {activeMenuId === c.id && (
                      <div className="absolute right-6 top-10 w-44 bg-white rounded-lg border border-gray-200 shadow-xl p-1 z-30">
                        <MenuItem onClick={() => { onOpenDetail(c); setActiveMenuId(null); }}>
                          View Semesters
                        </MenuItem>
                        <MenuItem onClick={() => { onEdit(c); setActiveMenuId(null); }}>
                          Edit Curriculum
                        </MenuItem>
                        {c.status !== 'ACTIVE' && (
                          <MenuItem onClick={() => { onPublish(c); setActiveMenuId(null); }}>
                            Publish
                          </MenuItem>
                        )}
                        {c.status !== 'ARCHIVED' && (
                          <MenuItem onClick={() => { onArchive(c); setActiveMenuId(null); }}>
                            Archive
                          </MenuItem>
                        )}
                        <MenuItem
                          onClick={() => { onDelete(c); setActiveMenuId(null); }}
                          danger
                        >
                          Delete
                        </MenuItem>
                      </div>
                    )}
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

function MenuItem({
  children,
  onClick,
  danger,
}: {
  children: React.ReactNode;
  onClick: () => void;
  danger?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      className={`w-full text-left px-3 py-2 text-xs font-semibold rounded-md ${
        danger
          ? 'text-red-600 hover:bg-red-50'
          : 'text-gray-700 hover:bg-gray-50'
      }`}
    >
      {children}
    </button>
  );
}