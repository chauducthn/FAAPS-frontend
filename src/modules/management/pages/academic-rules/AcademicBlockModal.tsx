import { useEffect, useState, type FormEvent } from 'react';
import { Clock, SpinnerGap } from '@phosphor-icons/react';
import { Modal } from '@/shared/components/ui/Modal';
import { ModalBody, ModalFooter, ModalHeader, modalButtonClass } from '@/shared/components/ui/ModalParts';
import type {
  AcademicBlockInput,
  AcademicBlockItem,
  AcademicBlockType,
} from '../../services/academic-block.service';

const BLOCK_TYPES: { value: AcademicBlockType; label: string }[] = [
  { value: 'PREP', label: 'PREP — English Prep Part' },
  { value: 'MAIN', label: 'MAIN — Standard Semester Block' },
  { value: 'FAST', label: 'FAST — Half-Term Block' },
  { value: 'INTENSIVE', label: 'INTENSIVE — End-of-Term / Retake' },
];

const INPUT_CLASS =
  'mt-1 h-9 w-full rounded-md border border-line bg-white px-3 text-[13px] text-ink-primary shadow-2xs ' +
  'transition-colors focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/15';

interface Props {
  open: boolean;
  editing: AcademicBlockItem | null;
  saving: boolean;
  onClose: () => void;
  onSubmit: (input: AcademicBlockInput) => void;
}

export function AcademicBlockModal({ open, editing, saving, onClose, onSubmit }: Props) {
  const [code, setCode] = useState('');
  const [name, setName] = useState('');
  const [blockType, setBlockType] = useState<AcademicBlockType>('MAIN');
  const [durationWeeks, setDurationWeeks] = useState('10');
  const [maxCourses, setMaxCourses] = useState('5');
  const [maxCredits, setMaxCredits] = useState('15');
  const [sortOrder, setSortOrder] = useState('10');
  const [active, setActive] = useState(true);
  const [description, setDescription] = useState('');

  useEffect(() => {
    if (!open) return;
    setCode(editing?.code ?? '');
    setName(editing?.name ?? '');
    setBlockType(editing?.blockType ?? 'MAIN');
    setDurationWeeks(String(editing?.durationWeeks ?? 10));
    setMaxCourses(String(editing?.maxCourses ?? 5));
    setMaxCredits(String(editing?.maxCredits ?? 15));
    setSortOrder(String(editing?.sortOrder ?? 10));
    setActive(editing?.active ?? true);
    setDescription(editing?.description ?? '');
  }, [open, editing]);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!code.trim() || !name.trim()) return;
    onSubmit({
      code: code.trim().toUpperCase(),
      name: name.trim(),
      blockType,
      durationWeeks: Math.max(1, Number(durationWeeks) || 10),
      maxCourses: Math.max(1, Number(maxCourses) || 5),
      maxCredits: Math.max(0, Number(maxCredits) || 0),
      sortOrder: Number(sortOrder) || 10,
      active,
      description: description.trim() || null,
    });
  };

  const title = editing ? `Edit Block · ${editing.code}` : 'Add Study Block';

  return (
    <Modal open={open} onClose={onClose} title={title} className="max-w-lg">
      <form onSubmit={handleSubmit} className="flex min-h-0 flex-col">
        <ModalHeader
          title={title}
          description="Configure block duration, course cap, and credit limit."
          icon={<Clock aria-hidden />}
          tone="brand"
          onClose={onClose}
          closeDisabled={saving}
        />
        <ModalBody className="space-y-4">
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label className="block text-xs font-medium text-ink-secondary">Block Code</label>
              <input required value={code} onChange={(e) => setCode(e.target.value)} placeholder="e.g. BLOCK_10W" className={INPUT_CLASS} />
            </div>
            <div>
              <label className="block text-xs font-medium text-ink-secondary">Block Type</label>
              <select value={blockType} onChange={(e) => setBlockType(e.target.value as AcademicBlockType)} className={INPUT_CLASS}>
                {BLOCK_TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-ink-secondary">Display Name</label>
            <input
              required value={name} onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Block 10W (Main Term)" className={INPUT_CLASS}
            />
          </div>

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <div>
              <label className="block text-xs font-medium text-ink-secondary">Weeks</label>
              <input
                type="number" min={1} max={30} value={durationWeeks}
                onChange={(e) => setDurationWeeks(e.target.value)} className={INPUT_CLASS}
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-ink-secondary">Max Courses</label>
              <input
                type="number" min={1} max={15} value={maxCourses}
                onChange={(e) => setMaxCourses(e.target.value)} className={INPUT_CLASS}
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-ink-secondary">Max Credits</label>
              <input
                type="number" min={0} max={36} value={maxCredits}
                onChange={(e) => setMaxCredits(e.target.value)} className={INPUT_CLASS}
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-ink-secondary">Order</label>
              <input
                type="number" min={0} max={99} value={sortOrder}
                onChange={(e) => setSortOrder(e.target.value)} className={INPUT_CLASS}
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-ink-secondary">Description</label>
            <input
              value={description} onChange={(e) => setDescription(e.target.value)}
              placeholder="Usage notes for students & AI roadmap" className={INPUT_CLASS}
            />
          </div>

          <label className="inline-flex cursor-pointer items-center gap-2 text-xs font-medium text-ink-secondary">
            <input type="checkbox" checked={active} onChange={(e) => setActive(e.target.checked)} className="size-4 accent-brand" />
            Active block
          </label>
        </ModalBody>

        <ModalFooter>
          <button type="button" onClick={onClose} disabled={saving} className={modalButtonClass('secondary')}>
            Cancel
          </button>
          <button type="submit" disabled={saving} className={modalButtonClass('primary')}>
            {saving && <SpinnerGap className="size-4 animate-spin" aria-hidden />}
            {editing ? 'Save changes' : 'Create block'}
          </button>
        </ModalFooter>
      </form>
    </Modal>
  );
}
