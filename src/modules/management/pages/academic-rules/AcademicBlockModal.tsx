import { useEffect, useState, type FormEvent } from 'react';
import { Modal } from '@/shared/components/ui/Modal';
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

const inputCls =
  'mt-1 h-9.5 w-full rounded-lg border border-line bg-white px-3 text-[13px] text-ink-primary focus:border-brand focus:outline-none';

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

  return (
    <Modal open={open} onClose={onClose} title={editing ? `Edit Block · ${editing.code}` : 'Add Study Block'}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <label className="block text-xs font-semibold text-ink-secondary">Block Code</label>
            <input required value={code} onChange={(e) => setCode(e.target.value)} placeholder="e.g. BLOCK_10W" className={inputCls} />
          </div>
          <div>
            <label className="block text-xs font-semibold text-ink-secondary">Block Type</label>
            <select value={blockType} onChange={(e) => setBlockType(e.target.value as AcademicBlockType)} className={inputCls}>
              {BLOCK_TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
            </select>
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-ink-secondary">Display Name</label>
          <input required value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Block 10W (Main Term)" className={inputCls} />
        </div>

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <div>
            <label className="block text-xs font-semibold text-ink-secondary">Weeks</label>
            <input type="number" min={1} max={30} value={durationWeeks} onChange={(e) => setDurationWeeks(e.target.value)} className={inputCls} />
          </div>
          <div>
            <label className="block text-xs font-semibold text-ink-secondary">Max Courses</label>
            <input type="number" min={1} max={15} value={maxCourses} onChange={(e) => setMaxCourses(e.target.value)} className={inputCls} />
          </div>
          <div>
            <label className="block text-xs font-semibold text-ink-secondary">Max Credits</label>
            <input type="number" min={0} max={36} value={maxCredits} onChange={(e) => setMaxCredits(e.target.value)} className={inputCls} />
          </div>
          <div>
            <label className="block text-xs font-semibold text-ink-secondary">Order</label>
            <input type="number" min={0} max={99} value={sortOrder} onChange={(e) => setSortOrder(e.target.value)} className={inputCls} />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-ink-secondary">Description</label>
          <input value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Usage notes for students & AI roadmap" className={inputCls} />
        </div>

        <label className="inline-flex cursor-pointer items-center gap-2 text-xs font-semibold text-ink-secondary">
          <input type="checkbox" checked={active} onChange={(e) => setActive(e.target.checked)} className="size-4 accent-brand" />
          Active block
        </label>

        <div className="flex justify-end gap-2 border-t border-line-soft pt-3">
          <button type="button" onClick={onClose} className="h-9 rounded-lg border border-line px-4 text-xs font-semibold text-ink-secondary hover:bg-surface-hover">
            Cancel
          </button>
          <button type="submit" disabled={saving} className="h-9 rounded-lg bg-brand px-4 text-xs font-semibold text-white hover:bg-brand-hover disabled:opacity-50">
            {saving ? 'Saving…' : editing ? 'Save changes' : 'Create block'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
