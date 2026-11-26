import { useState } from 'react';
import { X } from '@phosphor-icons/react';
import { cn } from '@/shared/lib/utils';

const MAJOR_CODE_PATTERN = /^[A-Z][A-Z0-9]{1,5}$/;

interface Props {
  open: boolean;
  existingCodes: string[];
  onClose: () => void;
  onAdd: (code: string) => void;
}

export function MajorCodeCreator({ open, existingCodes, onClose, onAdd }: Props) {
  const [draft, setDraft] = useState('');
  const [error, setError] = useState<string | null>(null);

  if (!open) return null;

  const resetAndClose = () => {
    setDraft('');
    setError(null);
    onClose();
  };

  const handleAdd = () => {
    const clean = draft.trim().toUpperCase();
    if (!MAJOR_CODE_PATTERN.test(clean)) {
      setError('Enter 2–6 uppercase letters or digits starting with a letter (e.g. SE, EN, K1).');
      return;
    }
    if (existingCodes.includes(clean)) {
      onAdd(clean);
      resetAndClose();
      return;
    }
    onAdd(clean);
    resetAndClose();
  };

  return (
    <div className="rounded-xl border border-gray-200 bg-gray-50/70 p-3.5">
      <div className="mb-2.5 flex items-center justify-between gap-2">
        <span className="text-xs font-semibold text-gray-800">New major code</span>
        <button
          type="button"
          onClick={resetAndClose}
          aria-label="Close new major code form"
          className="rounded-md p-1 text-gray-400 transition-colors hover:bg-gray-200/70 hover:text-gray-700"
        >
          <X className="size-3.5" />
        </button>
      </div>

      <div className="flex items-center gap-2">
        <input
          type="text"
          maxLength={6}
          placeholder="e.g. SE, EN, GD"
          aria-label="New major code"
          value={draft}
          onChange={(e) => {
            setError(null);
            setDraft(e.target.value.replace(/[^a-zA-Z0-9]/g, '').toUpperCase());
          }}
          className={cn(
            'h-9 w-full rounded-lg border bg-white px-3 text-[13px] uppercase text-gray-900 placeholder:normal-case placeholder:text-gray-400 focus:outline-none focus:ring-2',
            error
              ? 'border-red-300 focus:border-red-500 focus:ring-red-100'
              : 'border-gray-200 focus:border-[#F26F21] focus:ring-[#F26F21]/15',
          )}
        />
        <button
          type="button"
          onClick={resetAndClose}
          className="h-9 shrink-0 rounded-lg border border-gray-200 bg-white px-3 text-xs font-medium text-gray-700 transition-colors hover:bg-gray-50"
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={handleAdd}
          className="h-9 shrink-0 rounded-lg bg-[#F26F21] px-3 text-xs font-semibold text-white transition-colors hover:bg-[#e05f14]"
        >
          Add code
        </button>
      </div>

      {error && <p className="mt-2 text-xs font-medium text-red-600">{error}</p>}
    </div>
  );
}
