// Shown when an import file fails the check made before upload: lists what to fix
// and offers the example sheets, so the admin can correct the file and upload again.
import { AlertTriangle, Download, X } from 'lucide-react';
import { Modal } from '../../../shared/components/ui/Modal';
import type { ImportProblem } from '../utils/importChecks';

export interface ExampleSheet {
  label: string;
  download: () => void;
}

interface Props {
  open: boolean;
  fileName: string;
  problems: ImportProblem[];
  examples: ExampleSheet[];
  onClose: () => void;
}

const MAX_SHOWN = 50;

/** "Example sheet" next to an Import button: one example downloads straight away, several open a small menu. */
export function ExampleSheetButton({ examples, className }: { examples: ExampleSheet[]; className?: string }) {
  const base =
    className ??
    'inline-flex cursor-pointer items-center gap-1.5 rounded-xl border border-gray-200 bg-white px-3.5 py-2.5 text-xs font-bold text-gray-700 shadow-xs transition-all hover:border-orange-300 hover:bg-orange-50/50 hover:text-[#9a3412]';
  if (examples.length === 1) {
    return (
      <button type="button" onClick={examples[0].download} className={base}>
        <Download className="size-3.5" /> Example sheet
      </button>
    );
  }
  return (
    <details className="relative">
      <summary className={`${base} list-none [&::-webkit-details-marker]:hidden`}>
        <Download className="size-3.5" /> Example sheet
      </summary>
      <div className="absolute right-0 z-20 mt-1 w-56 rounded-xl border border-gray-200 bg-white p-1 shadow-lg" role="menu">
        {examples.map((e) => (
          <button
            key={e.label}
            type="button"
            role="menuitem"
            onClick={(event) => {
              e.download();
              (event.currentTarget.closest('details') as HTMLDetailsElement | null)?.removeAttribute('open');
            }}
            className="block w-full rounded-lg px-3 py-2 text-left text-xs font-semibold text-gray-700 hover:bg-orange-50 hover:text-[#9a3412]"
          >
            {e.label}
          </button>
        ))}
      </div>
    </details>
  );
}

export function ImportCheckDialog({ open, fileName, problems, examples, onClose }: Props) {
  const shown = problems.slice(0, MAX_SHOWN);
  return (
    <Modal open={open} onClose={onClose} title="Fix the import file" className="max-w-xl">
      <div className="flex items-start justify-between gap-4 border-b border-gray-100 bg-red-50 px-6 py-5">
        <div className="flex items-start gap-3">
          <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-red-100 text-red-600">
            <AlertTriangle className="size-5" />
          </span>
          <div className="min-w-0">
            <h2 className="text-base font-extrabold tracking-tight text-gray-900">The file was not uploaded</h2>
            <p className="mt-0.5 truncate text-xs text-gray-500">
              {fileName} has {problems.length} problem{problems.length === 1 ? '' : 's'}. Fix them and upload the file again.
            </p>
          </div>
        </div>
        <button type="button" onClick={onClose} aria-label="Close" className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-700">
          <X className="size-4" />
        </button>
      </div>

      <ul className="min-h-0 space-y-1.5 overflow-y-auto px-6 py-4 text-[13px]" aria-label="Problems in the file">
        {shown.map((p, i) => (
          <li key={i} className="flex gap-2 rounded-lg bg-red-50/60 px-3 py-2 text-red-700">
            <span className="shrink-0 font-mono text-[11px] font-bold text-red-500">{p.row === null ? 'File' : `Row ${p.row}`}</span>
            <span>{p.message}</span>
          </li>
        ))}
        {problems.length > MAX_SHOWN && (
          <li className="px-3 text-xs text-gray-500">…and {problems.length - MAX_SHOWN} more.</li>
        )}
      </ul>

      <div className="flex flex-wrap items-center justify-between gap-2 border-t border-gray-100 bg-gray-50/60 px-6 py-4">
        <div className="flex flex-wrap gap-2">
          {examples.map((e) => (
            <button
              key={e.label}
              type="button"
              onClick={e.download}
              className="inline-flex items-center gap-1.5 rounded-xl border border-gray-200 bg-white px-3 py-2 text-xs font-bold text-gray-700 hover:bg-gray-50"
            >
              <Download className="size-3.5" /> {e.label}
            </button>
          ))}
        </div>
        <button type="button" onClick={onClose} className="rounded-xl bg-gray-900 px-4 py-2 text-xs font-bold text-white hover:bg-gray-700">
          OK
        </button>
      </div>
    </Modal>
  );
}
