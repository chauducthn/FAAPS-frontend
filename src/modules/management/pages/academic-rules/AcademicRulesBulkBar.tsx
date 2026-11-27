import { CheckCircle as CheckCircle2, Prohibit as CircleOff, NotePencil as FileEdit, Trash as Trash2 } from '@phosphor-icons/react';
import { toast } from 'sonner';
import type { AcademicRule, AcademicRuleStatus } from '../../../academic/types/academic-rule';

export function AcademicRulesBulkBar({
  selectedRows,
  busy,
  onBulkStatus,
  onBulkDelete,
}: {
  selectedRows: AcademicRule[];
  busy: boolean;
  onBulkStatus: (rows: AcademicRule[], status: AcademicRuleStatus) => void;
  onBulkDelete: (rows: AcademicRule[]) => void;
}) {
  return (
    <>
      <button
        type="button"
        disabled={busy}
        onClick={() => onBulkStatus(selectedRows, 'ACTIVE')}
        className="inline-flex items-center gap-1.5 rounded-md bg-emerald-50 px-3 py-1.5 text-[13px] font-medium text-emerald-700 transition-colors hover:bg-emerald-100 disabled:opacity-50"
      >
        <CheckCircle2 className="size-3.5" /> Set active
      </button>
      <button
        type="button"
        disabled={busy}
        onClick={() => onBulkStatus(selectedRows, 'DRAFT')}
        className="inline-flex items-center gap-1.5 rounded-md bg-amber-50 px-3 py-1.5 text-[13px] font-medium text-amber-700 transition-colors hover:bg-amber-100 disabled:opacity-50"
      >
        <FileEdit className="size-3.5" /> Set draft
      </button>
      <button
        type="button"
        disabled={busy}
        onClick={() => onBulkStatus(selectedRows, 'INACTIVE')}
        className="inline-flex items-center gap-1.5 rounded-md bg-white px-3 py-1.5 text-[13px] font-medium text-ink-secondary ring-1 ring-line transition-colors hover:bg-surface-hover disabled:opacity-50"
      >
        <CircleOff className="size-3.5" /> Set inactive
      </button>
      <button
        type="button"
        disabled={busy}
        onClick={() => {
          const active = selectedRows.filter((r) => r.status === 'ACTIVE');
          if (active.length > 0) {
            toast.error(`${active.length} selected rule${active.length === 1 ? ' is' : 's are'} ACTIVE — archive them before deleting.`);
            return;
          }
          onBulkDelete(selectedRows);
        }}
        className="inline-flex items-center gap-1.5 rounded-md bg-red-50 px-3 py-1.5 text-[13px] font-medium text-red-700 transition-colors hover:bg-red-100 disabled:opacity-50"
      >
        <Trash2 className="size-3.5" /> Delete selected
      </button>
    </>
  );
}
