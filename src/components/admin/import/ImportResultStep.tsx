// src/components/admin/import/ImportResultStep.tsx
// Step 3: confirm result breakdown.
import { CheckCircle2, XCircle } from 'lucide-react';
import type { ImportConfirmResult } from '../../../types/import';

interface Props {
  result: ImportConfirmResult;
  onDone: () => void;
}

export default function ImportResultStep({ result, onDone }: Props) {
  return (
    <div className="p-6 space-y-5 text-xs">
      <div className="flex items-center gap-3">
        {result.failed === 0 ? (
          <CheckCircle2 className="size-8 text-emerald-600" />
        ) : (
          <XCircle className="size-8 text-amber-600" />
        )}
        <div>
          <h3 className="text-base font-bold text-gray-900">
            Import {result.failed === 0 ? 'completed' : 'finished with errors'}
          </h3>
          <p className="text-gray-600">Job ID: {result.jobId}</p>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Stat label="Inserted" value={result.inserted} tone="success" />
        <Stat label="Updated" value={result.updated} tone="muted" />
        <Stat label="Skipped" value={result.skipped} tone="muted" />
        <Stat label="Failed" value={result.failed} tone={result.failed > 0 ? 'danger' : 'muted'} />
      </div>

      {result.errors.length > 0 && (
        <div className="border border-red-200 bg-red-50/60 rounded-lg p-3 max-h-48 overflow-y-auto">
          <p className="font-bold text-red-700 mb-1">
            Errors ({result.errors.length})
          </p>
          <ul className="text-[11px] text-red-700 space-y-0.5">
            {result.errors.map((e, i) => (
              <li key={i}>
                Row {e.row} · {e.column}: {e.message}
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="pt-3 flex justify-end border-t border-gray-100">
        <button
          onClick={onDone}
          className="px-4 py-2 bg-[#F26F21] hover:bg-[#e05f14] text-white font-bold rounded-lg"
        >
          Done
        </button>
      </div>
    </div>
  );
}

function Stat({
  label,
  value,
  tone,
}: {
  label: string;
  value: number;
  tone: 'success' | 'danger' | 'muted';
}) {
  const color =
    tone === 'success'
      ? 'text-emerald-700'
      : tone === 'danger'
      ? 'text-red-700'
      : 'text-gray-700';
  return (
    <div className="border border-gray-200 rounded-lg p-3">
      <p className="text-[10px] font-bold uppercase text-gray-500">{label}</p>
      <p className={`text-xl font-extrabold mt-1 ${color}`}>{value}</p>
    </div>
  );
}