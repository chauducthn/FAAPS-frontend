import { useEffect, useState } from 'react';
import { CaretDown as ChevronDown, GraduationCap, SpinnerGap as Loader2, Plus, X } from '@phosphor-icons/react';
import { Modal } from '@/shared/components/ui/Modal';
import { cn } from '@/shared/lib/utils';
import type { CreateMajorDto } from '../../../academic/types/major';
import { MajorAcademicFields } from './MajorAcademicFields';
import { MajorCodeCreator } from './MajorCodeCreator';

interface CreateMajorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreateMajorDto) => void;
  initialData?: CreateMajorDto;
  existingCodes?: string[];
  isSaving?: boolean;
}

const MAJOR_CODE_PATTERN = /^[A-Z][A-Z0-9]{1,5}$/;

const EMPTY: CreateMajorDto = {
  code: '', name: '', description: '', totalCredits: 144, durationYears: 3.5, cohort: '', status: 'ACTIVE',
};

const fieldClass = (invalid?: boolean) =>
  cn(
    'h-10 w-full rounded-lg border bg-white px-3 text-[13px] text-gray-900 placeholder:text-gray-400 shadow-2xs transition-colors focus:outline-none focus:ring-2 disabled:cursor-not-allowed disabled:bg-gray-50 disabled:opacity-60',
    invalid
      ? 'border-red-300 focus:border-red-500 focus:ring-red-100'
      : 'border-gray-200 hover:border-gray-300 focus:border-[#F26F21] focus:ring-[#F26F21]/15',
  );

const labelClass = 'mb-1.5 block text-[13px] font-medium text-gray-700';

export default function CreateMajorModal({ isOpen, onClose, onSubmit, initialData, existingCodes = [], isSaving = false }: CreateMajorModalProps) {
  const [formData, setFormData] = useState<CreateMajorDto>(EMPTY);
  const [creatingCode, setCreatingCode] = useState(false);
  const [customCodes, setCustomCodes] = useState<string[]>([]);
  const editing = Boolean(initialData);
  const codeOptions = Array.from(
    new Set([...existingCodes, ...customCodes, ...(initialData?.code ? [initialData.code] : [])]),
  ).sort();

  useEffect(() => {
    if (!isOpen) return;
    setFormData(initialData ?? EMPTY);
    setCreatingCode(false);
    setCustomCodes([]);
  }, [isOpen, initialData]);

  const set = <K extends keyof CreateMajorDto>(key: K, value: CreateMajorDto[K]) =>
    setFormData((prev) => ({ ...prev, [key]: value }));

  const cleanCode = formData.code.trim().toUpperCase();
  const isValid = MAJOR_CODE_PATTERN.test(cleanCode)
    && formData.name.trim() !== '' && formData.totalCredits > 0 && formData.durationYears > 0;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValid) return;
    onSubmit({
      ...formData,
      code: cleanCode,
      name: formData.name.trim(),
      cohort: initialData?.cohort ?? '',
      description: initialData?.description ?? '',
    });
  };

  return (
    <Modal open={isOpen} onClose={() => !isSaving && onClose()} title={editing ? 'Edit major' : 'Create major'} className="max-w-xl">
      <form noValidate onSubmit={handleSubmit} className="flex min-h-0 flex-col">
        <div className="flex items-center justify-between gap-4 border-b border-gray-100 bg-white px-6 py-4">
          <div className="flex items-center gap-3">
            <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-orange-50 text-[#F26F21] ring-1 ring-orange-200/70">
              <GraduationCap className="size-4.5" />
            </span>
            <div>
              <h2 className="text-[15px] font-semibold text-gray-900">
                {editing ? 'Edit major' : 'Create major'}
              </h2>
              <p className="text-[13px] text-gray-500">
                {editing
                  ? 'Update major code, cohort, and credit requirements.'
                  : 'Configure a 2-letter major code and default degree settings.'}
              </p>
            </div>
          </div>
          <button
            type="button"
            disabled={isSaving}
            onClick={onClose}
            aria-label="Close dialog"
            className="rounded-lg p-1.5 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-700 disabled:opacity-40"
          >
            <X className="size-4" />
          </button>
        </div>

        <div className="space-y-4 overflow-y-auto px-6 py-5">
          <div className="grid gap-4 sm:grid-cols-3">
            <div>
              <div className="mb-1.5 flex items-center justify-between gap-1">
                <label htmlFor="major-code" className="block text-[13px] font-medium text-gray-700">
                  Major code <span className="text-[#F26F21]">*</span>
                </label>
                <button
                  type="button"
                  onClick={() => setCreatingCode((prev) => !prev)}
                  className="inline-flex items-center gap-0.5 text-xs font-medium text-[#C2410C] transition-colors hover:text-[#F26F21] hover:underline"
                >
                  <Plus className="size-3.5" aria-hidden />
                  {creatingCode ? 'Hide' : 'New code'}
                </button>
              </div>
              <div className="relative">
                <select
                  id="major-code"
                  value={formData.code}
                  onChange={(e) => set('code', e.target.value)}
                  className={cn(fieldClass(false), 'appearance-none pr-9', !formData.code && 'text-gray-400')}
                  required
                >
                  <option value="">Select code…</option>
                  {codeOptions.map((c) => <option key={c} value={c} className="text-gray-900">{c}</option>)}
                </select>
                <ChevronDown className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-gray-400" />
              </div>
            </div>

            <div className="sm:col-span-2">
              <label htmlFor="major-name" className={labelClass}>
                Major name <span className="text-[#F26F21]">*</span>
              </label>
              <input
                id="major-name"
                type="text"
                placeholder="e.g. Software Engineering"
                value={formData.name}
                onChange={(e) => set('name', e.target.value)}
                className={fieldClass(false)}
                required
              />
            </div>
          </div>

          <MajorCodeCreator
            open={creatingCode}
            existingCodes={codeOptions}
            onClose={() => setCreatingCode(false)}
            onAdd={(code) => {
              setCustomCodes((prev) => (prev.includes(code) ? prev : [...prev, code]));
              set('code', code);
            }}
          />

          <MajorAcademicFields
            formData={formData}
            inputClass={fieldClass(false)}
            labelClass={labelClass}
            onChange={set}
          />
        </div>

        <div className="flex items-center justify-end gap-2.5 border-t border-gray-100 bg-gray-50/70 px-6 py-3.5">
          <button
            type="button"
            disabled={isSaving}
            onClick={onClose}
            className="h-9 rounded-lg border border-gray-200 bg-white px-4 text-[13px] font-medium text-gray-700 transition-colors hover:bg-gray-50 disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSaving || !isValid}
            className="inline-flex h-9 items-center justify-center gap-2 rounded-lg bg-[#F26F21] px-4 text-[13px] font-semibold text-white transition-colors hover:bg-[#e05f14] disabled:cursor-not-allowed disabled:opacity-55"
          >
            {isSaving && <Loader2 className="size-4 animate-spin" />}
            {isSaving ? 'Saving…' : editing ? 'Save changes' : 'Create major'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
