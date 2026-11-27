import type { ReactNode } from 'react';
import type { FieldErrors, UseFormRegister, UseFormRegisterReturn, UseFormSetValue } from 'react-hook-form';
import { CaretDown as ChevronDown } from '@phosphor-icons/react';
import { cn } from '@/shared/lib/utils';
import type { CurriculumFormValues } from '../../../academic/validations/curriculum.schema';
import { todayIso, type SemesterDraft } from './semesterRangeUtils';
import { SemesterPickerField } from './SemesterPickerField';

const inputClass = (hasError?: boolean) =>
  cn(
    'h-10 w-full rounded-lg border bg-white px-3 text-[13px] text-ink-primary placeholder:text-ink-subtle shadow-2xs transition-colors focus:outline-none focus:ring-2 disabled:cursor-not-allowed disabled:bg-surface-page disabled:opacity-60',
    hasError
      ? 'border-red-300 focus:border-red-500 focus:ring-red-100'
      : 'border-line hover:border-ink-subtle/50 focus:border-brand focus:ring-brand/15',
  );

interface Props {
  noun: 'Cohort' | 'Curriculum';
  status: 'ACTIVE' | 'INACTIVE';
  majorId: string;
  displayName: string;
  startDraft: SemesterDraft;
  endDraft: SemesterDraft;
  startError?: string;
  endError?: string;
  isCurrentDisabled: boolean;
  majorList: { id: string; code: string; name: string }[];
  semesterList: { id: string; code: string; startDate?: string | null }[];
  register: UseFormRegister<CurriculumFormValues>;
  setValue: UseFormSetValue<CurriculumFormValues>;
  errors: FieldErrors<CurriculumFormValues>;
  onStartDraftChange: (next: SemesterDraft) => void;
  onEndDraftChange: (next: SemesterDraft) => void;
  onManualNameEdit: () => void;
}

export function CurriculumFormFields(props: Props) {
  const { noun, status, majorId, displayName, startDraft, endDraft, startError, endError } = props;
  const { isCurrentDisabled, majorList, semesterList, register, setValue, errors } = props;
  const { onStartDraftChange, onEndDraftChange, onManualNameEdit } = props;
  const nameField = register('name');
  const selectedMajor = majorList.find((m) => m.id === majorId);
  const cohortCodeOptions = Array.from(new Set(majorList.map((m) => m.code))).map((c) => ({ value: c, label: c }));
  const majorsForSelectedCode = selectedMajor ? majorList.filter((m) => m.code === selectedMajor.code) : [];

  const handleCohortCodeChange = (code: string) => {
    const match = majorList.find((m) => m.code === code);
    setValue('majorId', match ? match.id : '', { shouldValidate: true });
    setValue('name', match ? match.name : '', { shouldValidate: Boolean(match) });
  };
  const handleCohortNameChange = (targetMajorId: string) => {
    const match = majorList.find((m) => m.id === targetMajorId);
    setValue('majorId', targetMajorId, { shouldValidate: true });
    setValue('name', match ? match.name : '', { shouldValidate: true });
  };

  return (
    <div className="space-y-4 overflow-y-auto px-6 py-5">
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Major" required error={errors.majorId?.message}>
          {noun === 'Cohort' ? (
            <SelectBox value={selectedMajor?.code ?? ''} onChange={handleCohortCodeChange} label="Major" empty="Select a major…" hasValue={!!selectedMajor} hasError={!!errors.majorId} options={cohortCodeOptions} />
          ) : (
            <SelectBox reg={register('majorId')} label="Major" empty="Select a major…" hasValue={!!majorId} hasError={!!errors.majorId} options={majorList.map((m) => ({ value: m.id, label: `${m.code} — ${m.name}` }))} />
          )}
        </Field>
        <Field label="Cohort" required error={errors.version?.message}>
          <input {...register('version')} maxLength={3} placeholder="e.g. K19" aria-label="Cohort version" className={cn(inputClass(!!errors.version), 'uppercase placeholder:normal-case')} />
        </Field>
      </div>

      <Field label={noun === 'Cohort' ? 'Major name' : 'Display name'} required error={noun === 'Cohort' && !selectedMajor ? undefined : errors.name?.message}>
        {noun === 'Cohort' ? (
          <SelectBox
            value={selectedMajor ? majorId : ''}
            onChange={handleCohortNameChange}
            label="Major name"
            empty={selectedMajor ? 'Select a major name…' : 'Select a major first…'}
            hasValue={!!displayName}
            hasError={!!selectedMajor && !!errors.name}
            disabled={!selectedMajor}
            options={majorsForSelectedCode.map((m) => ({ value: m.id, label: m.name }))}
          />
        ) : (
          <input {...nameField} onChange={(e) => { onManualNameEdit(); void nameField.onChange(e); }} placeholder="e.g. Software Engineering K19" aria-label="Name" className={inputClass(!!errors.name)} />
        )}
      </Field>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Start semester" required error={startError}>
          <SemesterPickerField
            label="Start semester"
            draft={startDraft}
            semesters={semesterList}
            hasError={!!startError}
            onChange={onStartDraftChange}
          />
        </Field>
        <Field label="End semester" required error={endError}>
          <SemesterPickerField
            label="End semester"
            draft={endDraft}
            semesters={semesterList}
            minEndDate={todayIso()}
            hasError={!!endError}
            onChange={onEndDraftChange}
          />
        </Field>
      </div>

      <div className="grid items-start gap-4 sm:grid-cols-2">
        <Field label="Status" error={errors.status?.message}>
          <div className="grid h-10 grid-cols-2 gap-1 rounded-lg border border-line bg-surface-page p-1">
            {(['ACTIVE', 'INACTIVE'] as const).map((s) => (
              <label
                key={s}
                className={cn(
                  'flex cursor-pointer items-center justify-center rounded-md text-[13px] font-medium transition-colors',
                  status === s
                    ? s === 'ACTIVE'
                      ? 'bg-white font-semibold text-emerald-700 shadow-2xs ring-1 ring-emerald-200'
                      : 'bg-white font-semibold text-ink-secondary shadow-2xs ring-1 ring-line'
                    : 'text-ink-muted hover:text-ink-secondary',
                )}
              >
                <input type="radio" value={s} {...register('status')} className="sr-only" />
                {s === 'ACTIVE' ? 'Active' : 'Inactive'}
              </label>
            ))}
          </div>
        </Field>
        <Field label="Current version" error={errors.isCurrent?.message}>
          <label
            className={cn(
              'flex h-10 cursor-pointer items-center gap-2.5 rounded-lg border px-3 text-[13px] font-medium transition-colors',
              isCurrentDisabled
                ? 'cursor-not-allowed border-line-soft bg-surface-page text-ink-subtle'
                : 'border-line bg-white text-ink-secondary hover:border-ink-subtle/50',
            )}
          >
            <input type="checkbox" {...register('isCurrent')} disabled={isCurrentDisabled} className="size-4 shrink-0 rounded accent-brand" />
            <span className="truncate">Set as current {noun.toLowerCase()}</span>
          </label>
        </Field>
      </div>
    </div>
  );
}

function SelectBox({ reg, value, onChange, label, empty, hasValue, hasError, disabled, options }: {
  reg?: UseFormRegisterReturn; value?: string; onChange?: (v: string) => void;
  label: string; empty: string; hasValue: boolean; hasError: boolean; disabled?: boolean;
  options: { value: string; label: string }[];
}) {
  return (
    <div className="relative">
      <select {...(reg ?? { value, onChange: (e) => onChange?.(e.target.value) })} disabled={disabled} aria-label={label} className={cn(inputClass(hasError), 'appearance-none pr-9', !hasValue && 'text-ink-subtle')}>
        <option value="">{empty}</option>
        {options.map((o) => <option key={o.value} value={o.value} className="text-ink-primary">{o.label}</option>)}
      </select>
      <ChevronDown className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-ink-subtle" />
    </div>
  );
}

function Field({ label, required, error, children }: {
  label: string; required?: boolean; error?: string; children: ReactNode;
}) {
  return (
    <div>
      <label className="mb-1.5 block text-[13px] font-medium text-ink-secondary">
        {label}{required && <span className="ml-0.5 text-brand">*</span>}
      </label>
      {children}
      {error && <p className="mt-1 text-xs font-medium text-red-600">{error}</p>}
    </div>
  );
}
