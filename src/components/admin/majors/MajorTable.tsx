import { useState } from 'react';
import { MoreHorizontal } from 'lucide-react';

export interface MajorItem {
  id: string;
  code: string;
  name: string;
  cohort: string;
  status: 'ACTIVE' | 'INACTIVE' | 'DRAFT';
}

interface MajorTableProps {
  data: MajorItem[];
  selectedIds: string[];
  onSelectAll: (checked: boolean) => void;
  onSelectRow: (id: string) => void;
  onEditMajor: (item: MajorItem) => void;
  page: number;
  totalItems: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export default function MajorTable({
  data,
  selectedIds,
  onSelectAll,
  onSelectRow,
  onEditMajor,
  page,
  totalItems,
  totalPages,
  onPageChange,
}: MajorTableProps) {
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
                  className="rounded border-gray-300 text-[#F26F21] focus:ring-[#F26F21] cursor-pointer"
                />
              </th>
              <th className="p-4">CODE</th>
              <th className="p-4">MAJOR NAME</th>
              <th className="p-4">COHORT</th>
              <th className="p-4">STATUS</th>
              <th className="p-4 w-20 text-center">ACTIONS</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 text-xs font-medium text-gray-800">
            {data.map((item) => {
              const isSelected = selectedIds.includes(item.id);

              return (
                <tr
                  key={item.id}
                  className={`hover:bg-gray-50/60 transition-colors relative ${
                    isSelected ? 'bg-orange-50/20' : ''
                  }`}
                >
                  <td className="p-4 text-center">
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => onSelectRow(item.id)}
                      className="rounded border-gray-300 text-[#F26F21] focus:ring-[#F26F21] cursor-pointer"
                    />
                  </td>
                  <td className="p-4 font-bold text-gray-900">{item.code}</td>
                  <td className="p-4 font-semibold text-gray-900">{item.name}</td>
                  <td className="p-4 text-gray-600">{item.cohort}</td>
                  <td className="p-4">
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wide ${
                        item.status === 'ACTIVE'
                          ? 'bg-emerald-100/70 text-emerald-700'
                          : 'bg-amber-100/80 text-amber-700'
                      }`}
                    >
                      {item.status}
                    </span>
                  </td>
                  <td className="p-4 text-center relative">
                    <button
                      onClick={() =>
                        setActiveMenuId(activeMenuId === item.id ? null : item.id)
                      }
                      className="p-1 text-gray-400 hover:text-gray-700 rounded-md hover:bg-gray-100 cursor-pointer"
                    >
                      <MoreHorizontal className="size-4" />
                    </button>

                    {/* Popover Edit Menu */}
                    {activeMenuId === item.id && (
                      <div className="absolute right-6 top-10 w-44 bg-white rounded-lg border border-gray-200 shadow-xl p-1 z-30 animate-in fade-in zoom-in-95">
                        <button
                          onClick={() => {
                            onEditMajor(item);
                            setActiveMenuId(null);
                          }}
                          className="w-full text-left px-3 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-50 rounded-md transition-colors"
                        >
                          Edit Major
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

      {/* Pagination Footer */}
      <div className="p-4 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500">
        <span>Showing {totalItems === 0 ? 0 : page * 20 + 1}-{Math.min((page + 1) * 20, totalItems)} of {totalItems}</span>
        <div className="flex items-center gap-1 font-medium">
          <button disabled={page === 0} onClick={() => onPageChange(page - 1)} className="px-2.5 py-1 text-gray-400 hover:text-gray-700 disabled:opacity-50">
            Previous
          </button>
          <button className="w-6 h-6 bg-[#F26F21] text-white rounded-md text-xs font-bold flex items-center justify-center shadow-2xs">
            {page + 1}
          </button>
          <button disabled={page + 1 >= totalPages} onClick={() => onPageChange(page + 1)} className="px-2.5 py-1 text-gray-400 hover:text-gray-700 disabled:opacity-50">Next ›</button>
        </div>
      </div>
    </div>
  );
}
