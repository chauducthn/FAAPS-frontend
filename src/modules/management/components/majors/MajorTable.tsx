import { Pencil, Trash2 } from 'lucide-react';

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
  onDeleteMajor: (item: MajorItem) => void;
  page: number;
  totalItems: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

const statusPill = (status: MajorItem['status']) => {
  if (status === 'ACTIVE') return 'bg-emerald-50 text-emerald-700';
  if (status === 'DRAFT') return 'bg-amber-50 text-amber-700';
  return 'bg-gray-100 text-gray-600';
};

export default function MajorTable({
  data,
  selectedIds,
  onSelectAll,
  onSelectRow,
  onEditMajor,
  onDeleteMajor,
  page,
  totalItems,
  totalPages,
  onPageChange,
}: MajorTableProps) {
  const allSelected = data.length > 0 && selectedIds.length === data.length;

  if (data.length === 0) {
    return (
      <div className="px-6 py-14 text-center">
        <div className="mx-auto w-11 h-11 rounded-xl bg-gray-100 flex items-center justify-center text-gray-400 font-bold text-lg">M</div>
        <p className="mt-4 text-sm font-semibold text-[#111827]">No majors found</p>
        <p className="mt-1 text-[13px] text-gray-500">Try a different search, or create a new major to get started.</p>
      </div>
    );
  }

  return (
    <div>
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="text-[11px] font-semibold text-gray-500 uppercase tracking-[0.06em]">
              <th className="pl-6 pr-2 py-3 w-12 text-center font-semibold">
                <input
                  type="checkbox"
                  checked={allSelected}
                  onChange={(e) => onSelectAll(e.target.checked)}
                  aria-label="Select all majors"
                  className="size-4 rounded border-gray-300 text-[#F26F21] focus:ring-[#F26F21]/30 focus:ring-2 cursor-pointer align-middle"
                />
              </th>
              <th className="px-4 py-3 font-semibold">Code</th>
              <th className="px-4 py-3 font-semibold">Major name</th>
              <th className="px-4 py-3 font-semibold">Cohort</th>
              <th className="px-4 py-3 font-semibold">Status</th>
              <th className="pl-4 pr-6 py-3 w-24 text-right font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody className="text-[13px]">
            {data.map((item) => {
              const isSelected = selectedIds.includes(item.id);

              return (
                <tr
                  key={item.id}
                  className={`group border-t border-[#E5E7EB] transition-colors hover:bg-[#F9FAFB] ${
                    isSelected ? 'bg-orange-50/50 hover:bg-orange-50/70' : ''
                  }`}
                >
                  <td className="pl-6 pr-2 py-4 text-center">
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => onSelectRow(item.id)}
                      aria-label={`Select ${item.code}`}
                      className="size-4 rounded border-gray-300 text-[#F26F21] focus:ring-[#F26F21]/30 focus:ring-2 cursor-pointer align-middle"
                    />
                  </td>
                  <td className="px-4 py-4 font-semibold text-[#111827] tabular-nums whitespace-nowrap">{item.code}</td>
                  <td className="px-4 py-4 font-medium text-[#374151]">{item.name}</td>
                  <td className="px-4 py-4 text-gray-500 whitespace-nowrap">{item.cohort}</td>
                  <td className="px-4 py-4">
                    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-semibold leading-none ${statusPill(item.status)}`}>
                      {item.status === 'ACTIVE' ? 'Active' : item.status === 'DRAFT' ? 'Draft' : 'Inactive'}
                    </span>
                  </td>
                  <td className="pl-4 pr-6 py-4">
                    <div className="flex items-center justify-end gap-1 opacity-40 group-hover:opacity-100 focus-within:opacity-100 transition-opacity">
                      <button
                        onClick={() => onEditMajor(item)}
                        title={`Edit ${item.code}`}
                        aria-label={`Edit ${item.code}`}
                        className="p-1.5 rounded-md text-gray-400 hover:text-[#F26F21] hover:bg-orange-50 transition-colors cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-[#F26F21]/40"
                      >
                        <Pencil className="size-4" strokeWidth={2} />
                      </button>
                      <button
                        onClick={() => onDeleteMajor(item)}
                        title={`Delete ${item.code}`}
                        aria-label={`Delete ${item.code}`}
                        className="p-1.5 rounded-md text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500/40"
                      >
                        <Trash2 className="size-4" strokeWidth={2} />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Pagination footer */}
      <div className="px-6 py-3.5 border-t border-gray-100 flex items-center justify-between text-[13px] text-gray-500">
        <span>
          Showing {totalItems === 0 ? 0 : page * 20 + 1}-{Math.min((page + 1) * 20, totalItems)} of {totalItems}
        </span>
        <div className="flex items-center gap-1 font-medium">
          <button
            disabled={page === 0}
            onClick={() => onPageChange(page - 1)}
            className="px-2.5 py-1.5 rounded-md text-gray-500 hover:text-[#111827] hover:bg-gray-100 disabled:opacity-40 disabled:hover:bg-transparent disabled:hover:text-gray-500 transition-colors cursor-pointer disabled:cursor-default"
          >
            Previous
          </button>
          <span className="min-w-7 h-7 px-2 bg-[#F26F21] text-white rounded-md text-[13px] font-semibold inline-flex items-center justify-center shadow-[0_1px_2px_rgba(242,111,33,0.4)]">
            {page + 1}
          </span>
          <button
            disabled={page + 1 >= totalPages}
            onClick={() => onPageChange(page + 1)}
            className="px-2.5 py-1.5 rounded-md text-gray-500 hover:text-[#111827] hover:bg-gray-100 disabled:opacity-40 disabled:hover:bg-transparent disabled:hover:text-gray-500 transition-colors cursor-pointer disabled:cursor-default"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}
