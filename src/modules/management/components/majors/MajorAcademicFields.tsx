import { CaretDown as ChevronDown } from '@phosphor-icons/react';
import type { CreateMajorDto, MajorStatus } from '../../../academic/types/major';

interface Props {
  formData: CreateMajorDto;
  inputClass: string;
  labelClass: string;
  onChange: <K extends keyof CreateMajorDto>(key: K, value: CreateMajorDto[K]) => void;
}

export function MajorAcademicFields({ formData, inputClass, labelClass, onChange }: Props) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
      <div>
        <label htmlFor="major-credits" className={labelClass}>
          Total credits <span className="text-[#F26F21]">*</span>
        </label>
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

      <div>
        <label htmlFor="major-duration" className={labelClass}>
          Duration (years) <span className="text-[#F26F21]">*</span>
        </label>
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

      <div>
        <label htmlFor="major-status" className={labelClass}>
          Status <span className="text-[#F26F21]">*</span>
        </label>
        <div className="relative">
          <select
            id="major-status"
            value={formData.status}
            onChange={(e) => onChange('status', e.target.value as MajorStatus)}
            className={`${inputClass} appearance-none pr-9`}
            required
          >
            <option value="ACTIVE">Active</option>
            <option value="DRAFT">Draft</option>
            <option value="INACTIVE">Inactive</option>
          </select>
          <ChevronDown className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-gray-400" />
        </div>
      </div>
    </div>
  );
}
