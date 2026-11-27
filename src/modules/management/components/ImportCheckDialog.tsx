// Shown when an import file fails the check made before upload: lists what to fix
// and offers the example sheets, so the admin can correct the file and upload again.
import { useEffect, useRef, useState } from 'react';
import { Warning as AlertTriangle, CaretDown as ChevronDown, DownloadSimple as Download, FileXls } from '@phosphor-icons/react';
import { MENU_PANEL_CLASS, MenuItem, toolbarButtonClass } from '../../../shared/components/ui/MenuParts';
import { Modal } from '../../../shared/components/ui/Modal';
import { ModalBody, ModalFooter, ModalHeader, modalButtonClass } from '../../../shared/components/ui/ModalParts';
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
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const base =
    className ??
    toolbarButtonClass();

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (event: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(event.target as Node)) setOpen(false);
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false);
    };
    document.addEventListener('mousedown', onPointerDown);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('mousedown', onPointerDown);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [open]);

  if (examples.length === 1) {
    return (
      <button type="button" onClick={examples[0].download} className={base}>
        <Download className="size-4 text-ink-subtle" /> Example sheet
      </button>
    );
  }
  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        className={base}
      >
        <Download className="size-4 text-ink-subtle" aria-hidden /> Example sheet
        <ChevronDown className={`size-3.5 text-ink-subtle transition-transform ${open ? 'rotate-180' : ''}`} aria-hidden />
      </button>
      {open && (
        <div className={MENU_PANEL_CLASS} role="menu">
          {examples.map((e) => (
            <MenuItem
              key={e.label}
              icon={<FileXls />}
              onClick={() => {
                e.download();
                setOpen(false);
              }}
            >
              {e.label}
            </MenuItem>
          ))}
        </div>
      )}
    </div>
  );
}

export function ImportCheckDialog({ open, fileName, problems, examples, onClose }: Props) {
  const shown = problems.slice(0, MAX_SHOWN);
  const exampleButtons = examples.map((e) => (
    <button key={e.label} type="button" onClick={e.download} className={modalButtonClass('secondary', 'min-w-0 px-3')}>
      <Download className="size-4" /> {e.label}
    </button>
  ));

  return (
    <Modal open={open} onClose={onClose} title="Fix the import file" className="max-w-xl">
      <ModalHeader
        title="The file was not uploaded"
        description={`${fileName} has ${problems.length} problem${problems.length === 1 ? '' : 's'}. Fix them and upload the file again.`}
        icon={<AlertTriangle />}
        tone="danger"
        onClose={onClose}
      />

      <ModalBody>
        <ul
          className="divide-y divide-line overflow-hidden rounded-md border border-line text-[13px]"
          aria-label="Problems in the file"
        >
          {shown.map((p, i) => (
            <li key={i} className="flex items-baseline gap-3 px-3 py-2.5">
              <span className="w-14 shrink-0 font-mono text-[11px] font-semibold text-red-600">
                {p.row === null ? 'File' : `Row ${p.row}`}
              </span>
              <span className="min-w-0 text-ink-secondary">{p.message}</span>
            </li>
          ))}
          {problems.length > MAX_SHOWN && (
            <li className="bg-surface-page px-3 py-2 text-xs text-ink-muted">…and {problems.length - MAX_SHOWN} more.</li>
          )}
        </ul>
      </ModalBody>

      <ModalFooter start={exampleButtons.length > 0 ? exampleButtons : undefined}>
        <button type="button" onClick={onClose} className={modalButtonClass('primary')}>
          OK
        </button>
      </ModalFooter>
    </Modal>
  );
}
