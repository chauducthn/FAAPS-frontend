interface MajorSelectionBannerProps {
  selectedCount: number;
  onCancelSelection: () => void;
  onDeleteSelected: () => void;
}

export default function MajorSelectionBanner({
  selectedCount,
  onCancelSelection,
  onDeleteSelected,
}: MajorSelectionBannerProps) {
  if (selectedCount === 0) return null;

  return (
    <div className="bg-orange-50/60 border border-orange-200/80 rounded-xl p-3.5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 animate-in fade-in duration-150">
      <div className="flex items-center gap-3">
        <span className="bg-[#F26F21] text-white text-xs font-bold px-2.5 py-1 rounded-md">
          {selectedCount} selected
        </span>
        <div>
          <p className="text-xs font-bold text-gray-900">{selectedCount} eligible · 0 blocked</p>
          <p className="text-[11px] text-gray-500 mt-0.5">
            Referenced majors are excluded. Only the unused illustrative draft is selected.
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={onCancelSelection}
          className="px-3.5 py-1.5 bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 font-semibold text-xs rounded-lg transition-colors cursor-pointer"
        >
          Cancel selection
        </button>
        <button
          onClick={onDeleteSelected}
          className="px-3.5 py-1.5 bg-[#B91C1C] hover:bg-red-800 text-white font-semibold text-xs rounded-lg transition-colors cursor-pointer"
        >
          Delete {selectedCount} major
        </button>
      </div>
    </div>
  );
}