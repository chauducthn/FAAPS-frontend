import { useState, type ReactNode } from 'react';
import type { FieldErrors, UseFormRegister, UseFormRegisterReturn, UseFormSetValue } from 'react-hook-form';
import { ChevronDown, Plus } from 'lucide-react';
import { cn } from '@/shared/lib/utils';
import type { CurriculumFormValues } from '../../../academic/validations/curriculum.schema';
import { MIN_END_TERM_GAP, SemesterCreator, semesterOrdinal } from './SemesterCreator';

const inputClass = (hasError?: boolean) =>
  cn(
    'h-10 w-full rounded-lg border bg-white px-3 text-[13px] text-gray-900 placeholder:text-gray-400 shadow-2xs transition-colors focus:outline-none focus:ring-2 disabled:cursor-not-allowed disabled:bg-gray-50 disabled:opacity-60',
    hasError
      ? 'border-red-300 focus:border-red-500 focus:ring-red-100'
      : 'border-gray-200 hover:border-gray-300 focus:border-[#F26F21] focus:ring-[#F26F21]/15',
  );

interface Props {
  noun: 'Cohort' | 'Curriculum';
  status: 'ACTIVE' | 'INACTIVE';
  majorId: string;
  displayName: string;
  startSemesterId: string;
  endSemesterId: string;
  isCurrentDisabled: boolean;
  majorList: { id: string; code: string; name: string }[];
  semesterList: { id: string; code: string }[];
  isLoadingSemesters: boolean;
  register: UseFormRegister<CurriculumFormValues>;
  setValue: UseFormSetValue<CurriculumFormValues>;
  errors: FieldErrors<CurriculumFormValues>;
  onManualNameEdit: () => void;
}

export function CurriculumFormFields(props: Props) {
  const { noun, status, majorId, displayName, startSemesterId, endSemesterId, isCurrentDisabled, majorList, semesterList } = props;
  const { isLoadingSemesters, register, setValue, errors, onManualNameEdit } = props;
  const [semesterTarget, setSemesterTarget] = useState<'start' | 'end' | null>(null);
  const nameField = register('name');
  const selectedMajor = majorList.find((m) => m.id === majorId);
  const startSem = semesterList.find((s) => s.id === startSemesterId);
  const startOrd = startSem ? semesterOrdinal(startSem.code) : null;
  const endSemesterOptions = semesterList
    .filter((s) => {
      if (startOrd === null) return true;
      const ord = semesterOrdinal(s.code);
      return ord === null || ord - startOrd >= MIN_END_TERM_GAP;
    })
    .map((s) => ({ value: s.id, label: s.code }));
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
        <Field label="Start semester" required error={errors.effectiveFromSemesterId?.message} action={<NewSemesterToggle active={semesterTarget === 'start'} onClick={() => setSemesterTarget((v) => (v === 'start' ? null : 'start'))} />}>
          <SelectBox reg={register('effectiveFromSemesterId')} label="Start semester" empty="Select a semester…" hasValue={!!startSemesterId} hasError={!!errors.effectiveFromSemesterId} options={semesterList.map((s) => ({ value: s.id, label: s.code }))} />
        </Field>
        <Field label="End semester" required error={errors.effectiveToSemesterId?.message} action={<NewSemesterToggle active={semesterTarget === 'end'} onClick={() => setSemesterTarget((v) => (v === 'end' ? null : 'end'))} />}>
          <SelectBox reg={register('effectiveToSemesterId')} label="End semester" empty="Select end semester…" hasValue={!!endSemesterId} hasError={!!errors.effectiveToSemesterId} options={endSemesterOptions} />
        </Field>
      </div>

      <SemesterCreator
        target={semesterTarget}
        startSemesterCode={startSem?.code}
        existingSemesters={semesterList}
        onClose={() => setSemesterTarget(null)}
        onCreated={({ startId, endId }) => {
          if (startId) setValue('effectiveFromSemesterId', startId, { shouldValidate: true });
          if (endId) setValue('effectiveToSemesterId', endId, { shouldValidate: true });
        }}
      />

      {!isLoadingSemesters && semesterList.length === 0 && !semesterTarget && (
        <p className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-800">
          No semesters available yet. Click <strong>New semester</strong> above to create one.
        </p>
      )}

      <div className="grid items-start gap-4 sm:grid-cols-2">
        <Field label="Status" error={errors.status?.message}>
          <div className="grid h-10 grid-cols-2 gap-1 rounded-lg border border-gray-200 bg-gray-50 p-1">
            {(['ACTIVE', 'INACTIVE'] as const).map((s) => (
              <label
                key={s}
                className={cn(
                  'flex cursor-pointer items-center justify-center rounded-md text-[13px] font-medium transition-colors',
                  status === s
                    ? s === 'ACTIVE'
                      ? 'bg-white font-semibold text-emerald-700 shadow-2xs ring-1 ring-emerald-200'
                      : 'bg-white font-semibold text-gray-700 shadow-2xs ring-1 ring-gray-200'
                    : 'text-gray-500 hover:text-gray-700',
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
                ? 'cursor-not-allowed border-gray-100 bg-gray-50 text-gray-400'
                : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300',
            )}
          >
            <input type="checkbox" {...register('isCurrent')} disabled={isCurrentDisabled} className="size-4 shrink-0 rounded accent-[#F26F21]" />
            <span className="truncate">Set as current {noun.toLowerCase()}</span>
          </label>
        </Field>
      </div>
    </div>
  );
}

function NewSemesterToggle({ active, onClick }: { active: boolean; onClick: () => void }) {
  return (
    <button type="button" onClick={onClick} className="inline-flex items-center gap-1 text-xs font-medium text-[#C2410C] transition-colors hover:text-[#F26F21] hover:underline">
      <Plus className="size-3.5" aria-hidden />
      {active ? 'Hide' : 'New semester'}
    </button>
  );
}

function SelectBox({ reg, value, onChange, label, empty, hasValue, hasError, disabled, options }: {
  reg?: UseFormRegisterReturn; value?: string; onChange?: (v: string) => void;
  label: string; empty: string; hasValue: boolean; hasError: boolean; disabled?: boolean;
  options: { value: string; label: string }[];
}) {
  return (
    <div className="relative">
      <select {...(reg ?? { value, onChange: (e) => onChange?.(e.target.value) })} disabled={disabled} aria-label={label} className={cn(inputClass(hasError), 'appearance-none pr-9', !hasValue && 'text-gray-400')}>
        <option value="">{empty}</option>
        {options.map((o) => <option key={o.value} value={o.value} className="text-gray-900">{o.label}</option>)}
      </select>
      <ChevronDown className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-gray-400" />
    </div>
  );
}

function Field({ label, required, optional, error, action, children }: {
  label: string; required?: boolean; optional?: boolean; error?: string; action?: ReactNode; children: ReactNode;
}) {
  return (
    <div>
      <div className="mb-1.5 flex items-center justify-between gap-2">
        <label className="block text-[13px] font-medium text-gray-700">
          {label}{required && <span className="ml-0.5 text-[#F26F21]">*</span>}
          {optional && <span className="ml-1 text-xs font-normal text-gray-400">(optional)</span>}
        </label>
        {action}
      </div>
      {children}
      {error && <p className="mt-1 text-xs font-medium text-red-600">{error}</p>}
    </div>
  );
}
