// src/components/admin/import/ImportPreviewStep.tsx
// Step 2: show row-by-row preview with editable cells + error markers.

import { useMemo, useState } from 'react';
import { AlertTriangle, CheckCircle2 } from 'lucide-react';
import type { ImportPreview } from '../../../types/import';

interface Props {
  preview: ImportPreview;
  onChange: (next: ImportPreview) => void;
  onConfirm: () => void;
  onBack: () => void;
  isConfirming: boolean;
}

export default function ImportPreviewStep({
  preview,
  onChange,
  onConfirm,
  onBack,
  isConfirming,
}: Props) {
  const [filter, setFilter] = useState<'ALL' | 'INVALID'>('ALL');

  const rows = useMemo(() => {
    return filter === 'INVALID'
      ? preview.rows.filter((r) => !r.valid)
      : preview.rows;
  }, [preview.rows, filter]);

  const updateCell = (rowNumber: number, column: string, value: string) => {
    onChange({
      ...preview,
      rows: preview.rows.map((r) =>
        r.rowNumber === rowNumber ? { ...r, values: { ...r.values, [column]: value } } : r,
      ),
    });
  };

  const hasInvalid = preview.summary.invalidRows > 0;
  const canConfirm = !hasInvalid;

  return (
    <div className="space-y-4">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <SummaryPill label="Total" value={preview.summary.totalRows} />
          <SummaryPill
            label="Valid"
            value={preview.summary.validRows}
            tone="success"
          />
          <SummaryPill
            label="Invalid"
            value={preview.summary.invalidRows}
            tone={hasInvalid ? 'danger' : 'muted'}
          />
        </div>
        <div className="flex items-center gap-2">
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value as 'ALL' | 'INVALID')}
            className="px-3 py-1.5 border border-gray-200 rounded-md text-xs"
          >
            <option value="ALL">All rows</option>
            <option value="INVALID">Invalid only</option>
          </select>
        </div>
      </header>

      {hasInvalid && (
        <div className="flex items-start gap-2 p-3 border border-amber-200 bg-amber-50/60 rounded-lg text-xs text-amber-800">
          <AlertTriangle className="size-4 mt-0.5 shrink-0" />
          <div>
            <p className="font-bold">Fix invalid rows before confirming.</p>
            <p>
              The server will only insert valid rows. Fixing them server-side is not
              allowed; you must edit them here so the contract stays intact.
            </p>
          </div>
        </div>
      )}

      <div className="border border-gray-200 rounded-lg overflow-auto max-h-[480px]">
        <table className="w-full text-left text-xs">
          <thead className="bg-gray-50 sticky top-0">
            <tr>
              <th className="p-2 w-10">#</th>
              <th className="p-2 w-24">Status</th>
              {preview.summary.headers.map((h) => (
                <th key={h} className="p-2">
                  {h}
                </th>
              ))}
              <th className="p-2">Errors</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {rows.map((r) => (
              <tr key={r.rowNumber} className={r.valid ? '' : 'bg-red-50/40'}>
                <td className="p-2 text-gray-500">{r.rowNumber}</td>
                <td className="p-2">
                  {r.valid ? (
                    <span className="inline-flex items-center gap-1 text-emerald-700 font-bold">
                      <CheckCircle2 className="size-3.5" /> OK
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-red-600 font-bold">
                      <AlertTriangle className="size-3.5" /> {r.errors.length}
                    </span>
                  )}
                </td>
                {preview.summary.headers.map((h) => (
                  <td key={h} className="p-2">
                    <input
                      value={(r.values[h] ?? '') as string}
                      onChange={(e) => updateCell(r.rowNumber, h, e.target.value)}
                      className={`w-full px-2 py-1 border rounded ${
                        r.errors.some((er) => er.column === h)
                          ? 'border-red-300 bg-red-50/60'
                          : 'border-gray-200'
                      }`}
                    />
                  </td>
                ))}
                <td className="p-2 text-[10px] text-red-600">
                  {r.errors.map((er, i) => (
                    <div key={i}>
                      <span className="font-bold">{er.column}:</span> {er.message}
                    </div>
                  ))}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <footer className="pt-3 flex items-center justify-between border-t border-gray-100">
        <button
          onClick={onBack}
          className="px-4 py-2 border border-gray-200 text-gray-700 font-semibold rounded-lg hover:bg-gray-50"
        >
          Back
        </button>
        <button
          onClick={onConfirm}
          disabled={!canConfirm || isConfirming}
          className="px-4 py-2 bg-[#F26F21] hover:bg-[#e05f14] text-white font-bold rounded-lg disabled:opacity-60"
          title={hasInvalid ? 'Fix invalid rows first' : undefined}
        >
          {isConfirming ? 'Confirming...' : `Confirm (${preview.summary.validRows} rows)`}
        </button>
      </footer>
    </div>
  );
}

function SummaryPill({
  label,
  value,
  tone = 'muted',
}: {
  label: string;
  value: number;
  tone?: 'muted' | 'success' | 'danger';
}) {
  const color =
    tone === 'success'
      ? 'bg-emerald-100/70 text-emerald-700'
      : tone === 'danger'
      ? 'bg-red-100/70 text-red-700'
      : 'bg-gray-100 text-gray-700';
  return (
    <span
      className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold ${color}`}
    >
      {label}
      <span className="text-sm">{value}</span>
    </span>
  );
}