import { cn } from '@/shared/lib/utils';
import type { ImportHistory, ImportPreview } from '../../academic/services/studentAcademicService';
import { TranscriptImportRowsTable } from './TranscriptImportRowsTable';

const formatDateTime = (iso: string | null) =>
  iso
    ? new Date(iso).toLocaleString('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })
    : '—';

interface TranscriptImportHistoryProps {
  entries?: ImportHistory[];
  isError: boolean;
  detail: ImportPreview | null;
  onOpenDetail: (id: string) => void;
  onCloseDetail: () => void;
}

export function TranscriptImportHistory({
  entries,
  isError,
  detail,
  onOpenDetail,
  onCloseDetail,
}: TranscriptImportHistoryProps) {
  return (
    <div className="border-t border-[#f1f5f9] px-5 py-4">
      <h3 className="text-[13px] font-semibold text-[#151c27]">Import history</h3>
      {isError ? (
        <p className="mt-2 text-[13px] text-red-700">Could not load the import history.</p>
      ) : !entries?.length ? (
        <p className="mt-2 text-[13px] text-[#555f6f]">No imports yet.</p>
      ) : (
        <ul className="mt-2 divide-y divide-[#f1f5f9]">
          {entries.map((entry) => (
            <li key={entry.id} className="flex flex-wrap items-center justify-between gap-2 py-2.5 text-[13px]">
              <div className="min-w-0">
                <p className="truncate font-medium text-[#151c27]">{entry.fileName}</p>
                <p className="text-[12px] text-[#98a2b3]">
                  {formatDateTime(entry.createdAt)} · {entry.rowCount} row(s) · {entry.errorCount} error(s)
                </p>
              </div>
              <div className="flex items-center gap-3">
                <span
                  className={cn(
                    'rounded-full px-2.5 py-0.5 text-[11px] font-semibold ring-1 ring-inset',
                    entry.status === 'CONFIRMED'
                      ? 'bg-emerald-100 text-emerald-800 ring-emerald-200'
                      : 'bg-gray-100 text-gray-700 ring-gray-200',
                  )}
                >
                  {entry.status === 'CONFIRMED' ? 'Confirmed' : 'Preview only'}
                </span>
                <button
                  type="button"
                  onClick={() => onOpenDetail(entry.id)}
                  className="font-semibold text-[var(--brand)] hover:underline"
                >
                  View
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}

      {detail && (
        <div className="mt-3 space-y-2 rounded-lg border border-[#e5e7eb] p-3">
          <div className="flex items-center justify-between">
            <p className="text-[13px] font-semibold text-[#151c27]">
              Import detail · {detail.rowCount} row(s), {detail.errorCount} error(s)
            </p>
            <button type="button" onClick={onCloseDetail} className="text-[13px] font-semibold text-[#555f6f] underline">
              Close
            </button>
          </div>
          <TranscriptImportRowsTable preview={detail} />
        </div>
      )}
    </div>
  );
}
