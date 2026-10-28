import { useEffect, useState } from 'react';
import { X, BookOpen, Hash, Layers, Clock, AlignLeft, Users, Flag } from 'lucide-react';
import { CreateMajorDto, MajorStatus } from '../../../academic/types/major';

interface CreateMajorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreateMajorDto) => void;
  initialData?: CreateMajorDto;
  isSaving?: boolean;
}

const EMPTY: CreateMajorDto = {
  code: '',
  name: '',
  description: '',
  totalCredits: 144,
  durationYears: 3.5,
  cohort: '',
  status: 'DRAFT',
};

const inputClass =
  'w-full pl-10 pr-3.5 py-2.5 bg-[#F9FAFB] border border-transparent rounded-lg text-[13px] text-[#111827] placeholder:text-gray-400 placeholder:font-normal focus:outline-none focus:bg-white focus:border-[#F26F21] focus:ring-[3px] focus:ring-[#F26F21]/15 transition-all';
const labelClass = 'block text-xs font-semibold text-[#374151] mb-1.5';

export default function CreateMajorModal({ isOpen, onClose, onSubmit, initialData, isSaving = false }: CreateMajorModalProps) {
  const [formData, setFormData] = useState<CreateMajorDto>(EMPTY);
  const editing = Boolean(initialData);

  useEffect(() => {
    if (isOpen) setFormData(initialData ?? EMPTY);
  }, [isOpen, initialData]);

  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({ ...formData, code: formData.code.trim().toUpperCase(), name: formData.name.trim(), cohort: formData.cohort.trim().toUpperCase() });
  };

  const set = <K extends keyof CreateMajorDto>(key: K, value: CreateMajorDto[K]) =>
    setFormData((prev) => ({ ...prev, [key]: value }));

  const isValid = formData.code.trim() !== '' && formData.name.trim() !== '' && formData.cohort.trim() !== '';

  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4 animate-in fade-in duration-150" onClick={onClose}>
      <div
        role="dialog"
        aria-modal="true"
        aria-label={editing ? 'Edit major' : 'Create major'}
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-xl shadow-[0_20px_50px_-12px_rgba(16,24,40,0.25)] w-full max-w-[800px] max-h-[90vh] overflow-y-auto animate-in zoom-in-95 slide-in-from-bottom-2 duration-200"
      >
        {/* Header */}
        <div className="px-7 pt-6 pb-5 flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-orange-100/80 text-[#F26F21] flex items-center justify-center shrink-0">
              <BookOpen className="size-5" strokeWidth={2} />
            </div>
            <div>
              <h3 className="font-bold text-[#111827] text-base leading-tight">{editing ? 'Edit Major' : 'Create New Major'}</h3>
              <p className="text-[13px] text-gray-500 mt-0.5">{editing ? 'Update major details below.' : 'Add a new major to the master data.'}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Close dialog"
            className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 p-1.5 rounded-lg transition-colors cursor-pointer"
          >
            <X className="size-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="px-7 pb-7">
          {/* Section: Major details */}
          <p className="text-[11px] font-semibold text-gray-500 uppercase tracking-[0.06em] pb-2 border-b border-gray-100">Major details</p>
          <div className="pt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="major-code" className={labelClass}>Major code <span className="text-red-500">*</span></label>
              <div className="relative">
                <Hash className="size-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                <input
                  id="major-code"
                  type="text"
                  placeholder="SE"
                  value={formData.code}
                  onChange={(e) => set('code', e.target.value.toUpperCase())}
                  className={`${inputClass} font-semibold uppercase tracking-wide`}
                  required
                />
              </div>
            </div>
            <div>
              <label htmlFor="major-cohort" className={labelClass}>Cohort <span className="text-red-500">*</span></label>
              <div className="relative">
                <Users className="size-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                <input
                  id="major-cohort"
                  type="text"
                  placeholder="K19"
                  value={formData.cohort}
                  onChange={(e) => set('cohort', e.target.value.toUpperCase())}
                  className={`${inputClass} font-semibold uppercase tracking-wide`}
                  required
                />
              </div>
            </div>
            <div className="sm:col-span-2">
              <label htmlFor="major-name" className={labelClass}>Major name <span className="text-red-500">*</span></label>
              <div className="relative">
                <BookOpen className="size-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                <input
                  id="major-name"
                  type="text"
                  placeholder="e.g. Software Engineering"
                  value={formData.name}
                  onChange={(e) => set('name', e.target.value)}
                  className={inputClass}
                  required
                />
              </div>
            </div>
            <div className="sm:col-span-2">
              <label htmlFor="major-desc" className={labelClass}>Description</label>
              <div className="relative">
                <AlignLeft className="size-4 absolute left-3.5 top-3.5 text-gray-400 pointer-events-none" />
                <textarea
                  id="major-desc"
                  rows={3}
                  placeholder="Describe the focus, outcomes, or notes for this major..."
                  value={formData.description || ''}
                  onChange={(e) => set('description', e.target.value)}
                  className={`${inputClass} resize-none !pl-10`}
                />
              </div>
            </div>
          </div>

          {/* Section: Academic settings */}
          <p className="mt-8 text-[11px] font-semibold text-gray-500 uppercase tracking-[0.06em] pb-2 border-b border-gray-100">Academic settings</p>
          <div className="pt-4 grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label htmlFor="major-credits" className={labelClass}>Total credits <span className="text-red-500">*</span></label>
              <div className="relative">
                <Layers className="size-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                <input
                  id="major-credits"
                  type="number"
                  min={1}
                  value={formData.totalCredits}
                  onChange={(e) => set('totalCredits', Number(e.target.value))}
                  className={`${inputClass} tabular-nums`}
                  required
                />
              </div>
            </div>
            <div>
              <label htmlFor="major-duration" className={labelClass}>Duration (years) <span className="text-red-500">*</span></label>
              <div className="relative">
                <Clock className="size-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                <input
                  id="major-duration"
                  type="number"
                  step="0.5"
                  min={1}
                  value={formData.durationYears}
                  onChange={(e) => set('durationYears', Number(e.target.value))}
                  className={`${inputClass} tabular-nums`}
                  required
                />
              </div>
            </div>
            <div>
              <label htmlFor="major-status" className={labelClass}>Status <span className="text-red-500">*</span></label>
              <div className="relative">
                <Flag className="size-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                <select
                  id="major-status"
                  value={formData.status}
                  onChange={(e) => set('status', e.target.value as MajorStatus)}
                  className={`${inputClass} appearance-none cursor-pointer font-medium`}
                  required
                >
                  <option value="DRAFT">Draft</option>
                  <option value="ACTIVE">Active</option>
                  <option value="INACTIVE">Inactive</option>
                </select>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="mt-8 pt-5 border-t border-gray-100 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 text-[13px] font-semibold text-gray-600 hover:text-[#111827] hover:bg-gray-100 rounded-lg transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSaving || !isValid}
              className="px-5 py-2.5 bg-[#F26F21] hover:bg-[#d95e13] active:bg-[#c55310] disabled:opacity-50 disabled:cursor-not-allowed text-white text-[13px] font-semibold rounded-lg transition-all cursor-pointer shadow-[0_1px_2px_rgba(242,111,33,0.45),0_8px_16px_-6px_rgba(242,111,33,0.35)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#F26F21]/40 focus-visible:ring-offset-2"
            >
              {isSaving ? 'Saving...' : editing ? 'Save Changes' : 'Create Major'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
