import { Layers, Clock, Flag } from 'lucide-react';
import type { CreateMajorDto, MajorStatus } from '../../../academic/types/major';

interface Props {
  formData: CreateMajorDto;
  inputClass: string;
  labelClass: string;
  onChange: <K extends keyof CreateMajorDto>(key: K, value: CreateMajorDto[K]) => void;
}

export function MajorAcademicFields({ formData, inputClass, labelClass, onChange }: Props) {
  return (
    <>
      <p className="mt-8 text-[11px] font-semibold text-gray-500 uppercase tracking-[0.06em] pb-2 border-b border-gray-100">
        Academic settings
      </p>
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
              onChange={(e) => onChange('totalCredits', Number(e.target.value))}
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
              onChange={(e) => onChange('durationYears', Number(e.target.value))}
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
              onChange={(e) => onChange('status', e.target.value as MajorStatus)}
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
    </>
  );
}
