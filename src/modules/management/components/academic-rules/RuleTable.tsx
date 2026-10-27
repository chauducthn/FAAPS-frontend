// src/components/management/academic-rules/RuleTable.tsx
import { useState } from 'react';
import { MoreHorizontal } from 'lucide-react';
import type { AcademicRule } from '../../../academic/types/academic-rule';

interface Props {
  data: AcademicRule[];
  selectedIds: string[];
  onSelectAll: (checked: boolean) => void;
  onSelectRow: (id: string) => void;
  onView: (r: AcademicRule) => void;
  onEdit: (r: AcademicRule) => void;
  onDelete: (r: AcademicRule) => void;
  onToggle: (r: AcademicRule, nextActive: boolean) => void;
}

export default function RuleTable({
  data,
  selectedIds,
  onSelectAll,
  onSelectRow,
  onView,
  onEdit,
  onDelete,
  onToggle,
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
              <th className="p-4">Type</th>
              <th className="p-4">Curriculum</th>
              <th className="p-4">Description</th>
              <th className="p-4 text-center">Priority</th>
              <th className="p-4 text-center">Approval</th>
              <th className="p-4">Status</th>
              <th className="p-4 w-20 text-center">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 text-xs font-medium text-gray-800">
            {data.length === 0 && (
              <tr>
                <td colSpan={8} className="p-8 text-center text-xs text-gray-500">
                  No academic rules yet. Create one to start enforcing policies.
                </td>
              </tr>
            )}
            {data.map((r) => {
              const isSelected = selectedIds.includes(r.id);
              return (
                <tr
                  key={r.id}
                  className={`hover:bg-gray-50/60 transition-colors ${
                    isSelected ? 'bg-orange-50/20' : ''
                  }`}
                >
                  <td className="p-4 text-center">
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => onSelectRow(r.id)}
                      className="rounded border-gray-300 text-[#F26F21]"
                    />
                  </td>
                  <td className="p-4 font-bold text-gray-900">{r.policyType}</td>
                  <td className="p-4 text-gray-700">{r.curriculumName}</td>
                  <td className="p-4 text-gray-600 max-w-xs truncate">{r.description ?? '—'}</td>
                  <td className="p-4 text-center">{r.priority}</td>
                  <td className="p-4 text-center">
                    {r.approvalRequired ? (
                      <span className="inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-amber-100/80 text-amber-700">
                        Required
                      </span>
                    ) : (
                      <span className="text-gray-400">—</span>
                    )}
                  </td>
                  <td className="p-4">
                    <span
                      className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                        r.isActive
                          ? 'bg-emerald-100/70 text-emerald-700'
                          : 'bg-gray-100 text-gray-600'
                      }`}
                    >
                      {r.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="p-4 text-center relative">
                    <button
                      onClick={() => setActiveMenuId(activeMenuId === r.id ? null : r.id)}
                      className="p-1 text-gray-400 hover:text-gray-700 rounded-md hover:bg-gray-100"
                    >
                      <MoreHorizontal className="size-4" />
                    </button>
                    {activeMenuId === r.id && (
                      <div className="absolute right-6 top-10 w-48 bg-white rounded-lg border border-gray-200 shadow-xl p-1 z-30">
                        <button
                          onClick={() => {
                            onView(r);
                            setActiveMenuId(null);
                          }}
                          className="w-full text-left px-3 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-50 rounded-md"
                        >
                          View Detail
                        </button>
                        <button
                          onClick={() => {
                            onEdit(r);
                            setActiveMenuId(null);
                          }}
                          className="w-full text-left px-3 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-50 rounded-md"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => {
                            onToggle(r, !r.isActive);
                            setActiveMenuId(null);
                          }}
                          className="w-full text-left px-3 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-50 rounded-md"
                        >
                          {r.isActive ? 'Deactivate' : 'Activate'}
                        </button>
                        <button
                          onClick={() => {
                            onDelete(r);
                            setActiveMenuId(null);
                          }}
                          className="w-full text-left px-3 py-2 text-xs font-semibold text-red-600 hover:bg-red-50 rounded-md"
                        >
                          Delete
                        </button>
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