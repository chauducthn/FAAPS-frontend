import { useMemo } from 'react';
import { ArrowsLeftRight, CheckCircle, Trash } from '@phosphor-icons/react';
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
  busy?: boolean;
  detail: ImportPreview | null;
  onOpenDetail: (id: string) => void;
  onActivateVersion?: (entry: ImportHistory) => void;
  onDeleteVersion?: (entry: ImportHistory) => void;
  onCloseDetail: () => void;
}

export function TranscriptImportHistory({
  entries,
  isError,
  busy = false,
  detail,
  onOpenDetail,
  onActivateVersion,
  onDeleteVersion,
  onCloseDetail,
}: TranscriptImportHistoryProps) {
  const activeId = useMemo(() => {
    const confirmed = (entries ?? []).filter((e) => e.status === 'CONFIRMED' && e.confirmedAt);
    if (confirmed.length === 0) return null;
    return confirmed.reduce((best, cur) =>
      new Date(cur.confirmedAt!).getTime() > new Date(best.confirmedAt!).getTime() ? cur : best,
    ).id;
  }, [entries]);

  return (
    <div className="border-t border-gray-100 px-6 py-4">
      <div className="flex items-center justify-between gap-2">
        <h3 className="text-xs font-bold uppercase tracking-wide text-gray-500">Import Versions</h3>
        {entries && entries.length > 0 && (
          <span className="text-[11px] font-medium text-gray-400">{entries.length} version(s)</span>
        )}
      </div>

      {isError ? (
        <p className="mt-2 text-xs text-red-700">Could not load import history.</p>
      ) : !entries?.length ? (
        <p className="mt-2 text-xs text-gray-400">No transcript imports yet.</p>
      ) : (
        <ul className="mt-2.5 divide-y divide-gray-100">
          {entries.map((entry, idx) => {
            const isLatest = idx === 0;
            const isActive = entry.id === activeId;
            const hasValidRows = entry.rowCount > entry.errorCount;
            return (
              <li key={entry.id} className="flex flex-wrap items-center justify-between gap-2 py-2.5 text-xs">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-1.5">
                    <span className="font-mono text-[11px] font-bold text-gray-400">v{entries.length - idx}</span>
                    <p className="truncate font-semibold text-gray-900">{entry.fileName}</p>
                    {isLatest && (
                      <span className="rounded-full bg-orange-50 px-2 py-0.5 text-[10px] font-semibold text-[#C2410C]">
                        Latest
                      </span>
                    )}
                    {isActive && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold text-emerald-700">
                        <CheckCircle className="size-3" weight="fill" /> Active
                      </span>
                    )}
                  </div>
                  <p className="mt-0.5 text-[11px] text-gray-400">
                    {formatDateTime(entry.createdAt)} · {entry.rowCount} row(s)
                    {entry.errorCount > 0 ? ` · ${entry.errorCount} error(s)` : ''}
                  </p>
                </div>

                <div className="flex shrink-0 items-center gap-2">
                  {!isActive && hasValidRows && onActivateVersion && (
                    <button
                      type="button"
                      disabled={busy}
                      onClick={() => onActivateVersion(entry)}
                      className="inline-flex h-7 items-center gap-1 rounded-lg border border-gray-200 bg-white px-2.5 text-[11px] font-semibold text-gray-700 hover:border-orange-300 hover:text-[#C2410C] disabled:opacity-50"
                    >
                      <ArrowsLeftRight className="size-3" /> Use version
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => onOpenDetail(entry.id)}
                    className="h-7 px-2 text-[11px] font-semibold text-gray-500 hover:text-[#C2410C]"
                  >
                    View
                  </button>
                  {!isActive && onDeleteVersion && (
                    <button
                      type="button"
                      disabled={busy}
                      title="Delete this old import version"
                      aria-label={`Delete ${entry.fileName}`}
                      onClick={() => onDeleteVersion(entry)}
                      className="inline-flex size-7 items-center justify-center rounded-lg text-gray-400 transition-colors hover:bg-red-50 hover:text-red-600 disabled:opacity-50"
                    >
                      <Trash className="size-3.5" />
                    </button>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      )}

      {detail && (
        <div className="mt-3 space-y-2 rounded-xl border border-gray-200 bg-gray-50/40 p-3">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold text-gray-800">
              Snapshot detail · {detail.rowCount} row(s), {detail.errorCount} error(s)
            </p>
            <button type="button" onClick={onCloseDetail} className="text-xs font-semibold text-gray-500 hover:text-gray-900">
              Close
            </button>
          </div>
          <TranscriptImportRowsTable preview={detail} />
        </div>
      )}
    </div>
  );
}
