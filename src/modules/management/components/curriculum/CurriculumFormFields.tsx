import type { ReactNode } from 'react';
import type { FieldErrors, UseFormRegister, UseFormSetValue } from 'react-hook-form';
import { cn } from '@/shared/lib/utils';
import type { CurriculumFormValues } from '../../../academic/validations/curriculum.schema';
import { SemesterCreator } from './SemesterCreator';

const field =
  'w-full rounded-xl border border-gray-200 bg-gray-50/50 px-3.5 py-2.5 text-[13px] font-medium text-gray-900 placeholder:font-normal placeholder:text-gray-400 transition-all focus:border-[#F26F21] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#F26F21]/20 disabled:cursor-not-allowed disabled:opacity-60';
const labelClass = 'mb-1.5 block text-[11px] font-extrabold uppercase tracking-[0.06em] text-gray-500';

interface MajorOption {
  id: string;
  code: string;
  name: string;
}

interface SemesterOption {
  id: string;
  code: string;
}

interface Props {
  noun: 'Cohort' | 'Curriculum';
  status: 'ACTIVE' | 'INACTIVE';
  isCurrentDisabled: boolean;
  majorList: MajorOption[];
  semesterList: SemesterOption[];
  isLoadingSemesters: boolean;
  register: UseFormRegister<CurriculumFormValues>;
  setValue: UseFormSetValue<CurriculumFormValues>;
  errors: FieldErrors<CurriculumFormValues>;
}

export function CurriculumFormFields({
  noun,
  status,
  isCurrentDisabled,
  majorList,
  semesterList,
  isLoadingSemesters,
  register,
  setValue,
  errors,
}: Props) {
  return (
    <div className="space-y-5 overflow-y-auto px-6 py-6 text-[13px]">
      <Section title="Identity" hint="Which major and which intake this version belongs to.">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Major" required error={errors.majorId?.message}>
            <select {...register('majorId')} className={field} aria-label="Major">
              <option value="">Select a major…</option>
              {majorList.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.code} — {m.name}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Cohort (version)" required error={errors.version?.message} hint="e.g. K19, K20, K21">
            <input {...register('version')} placeholder="K19" className={cn(field, 'font-mono font-bold uppercase')} aria-label="Cohort version" />
          </Field>
        </div>
        <Field label="Display name" required error={errors.name?.message}>
          <input {...register('name')} placeholder="Software Engineering K19" className={field} aria-label="Name" />
        </Field>
      </Section>

      <Section title="Validity period" hint="The semester range this version covers.">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Start semester" required error={errors.effectiveFromSemesterId?.message}>
            <select {...register('effectiveFromSemesterId')} className={field} aria-label="Start semester">
              <option value="">Select a semester…</option>
              {semesterList.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.code}
                </option>
              ))}
            </select>
            <SemesterCreator onCreated={(id) => setValue('effectiveFromSemesterId', id, { shouldValidate: true })} />
          </Field>
          <Field label="End semester" error={errors.effectiveToSemesterId?.message} hint="Empty = still in use">
            <select {...register('effectiveToSemesterId')} className={field} aria-label="End semester">
              <option value="">No end (still in use)</option>
              {semesterList.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.code}
                </option>
              ))}
            </select>
          </Field>
        </div>
        {!isLoadingSemesters && semesterList.length === 0 && (
          <p className="rounded-xl bg-amber-50 px-3.5 py-2.5 text-[12px] font-medium leading-relaxed text-amber-800 ring-1 ring-amber-200">
            No semesters are available yet. Add the first semester above to continue.
          </p>
        )}
      </Section>

      <Section title="Details" hint="Optional context plus publishing state.">
        <Field label="Description" error={errors.description?.message}>
          <textarea rows={3} {...register('description')} placeholder="Intake notes, accreditation remarks…" className={cn(field, 'resize-none leading-relaxed')} aria-label="Description" />
        </Field>
        <div className="grid items-start gap-4 sm:grid-cols-2">
          <Field label="Status" error={errors.status?.message}>
            <div className="grid grid-cols-2 gap-2 rounded-xl bg-gray-100 p-1">
              {(['ACTIVE', 'INACTIVE'] as const).map((s) => (
                <label
                  key={s}
                  className={cn(
                    'cursor-pointer rounded-lg px-3 py-2 text-center text-xs font-bold transition-all',
                    status === s
                      ? s === 'ACTIVE'
                        ? 'bg-white text-emerald-700 shadow-xs ring-1 ring-emerald-200'
                        : 'bg-white text-gray-600 shadow-xs ring-1 ring-gray-200'
                      : 'text-gray-400 hover:text-gray-600',
                  )}
                >
                  <input type="radio" value={s} {...register('status')} className="sr-only" />
                  {s === 'ACTIVE' ? '● Active' : '○ Inactive'}
                </label>
              ))}
            </div>
          </Field>
          <div>
            <span className={labelClass}>Current version</span>
            <label
              className={cn(
                'flex cursor-pointer items-start gap-2.5 rounded-xl border px-3.5 py-2.5 transition-colors',
                isCurrentDisabled ? 'cursor-not-allowed border-gray-100 bg-gray-50 opacity-60' : 'border-gray-200 hover:border-orange-300 hover:bg-orange-50/40',
              )}
            >
              <input type="checkbox" {...register('isCurrent')} disabled={isCurrentDisabled} className="mt-0.5 size-4 shrink-0 rounded accent-[#F26F21]" />
              <span className="text-xs font-medium leading-relaxed text-gray-700">
                Use as the current {noun.toLowerCase()} of this major
                {isCurrentDisabled && <span className="block text-[11px] text-gray-400">Only an active record can be current.</span>}
              </span>
            </label>
            {errors.isCurrent?.message && <p className="mt-1.5 text-[11px] font-medium text-red-600">{errors.isCurrent.message}</p>}
          </div>
        </div>
      </Section>
    </div>
  );
}

function Section({ title, hint, children }: { title: string; hint: string; children: ReactNode }) {
  return (
    <section className="rounded-2xl border border-gray-100 bg-white p-4 shadow-[0_1px_2px_rgba(16,24,40,0.04)]">
      <h3 className="text-[13px] font-extrabold tracking-tight text-gray-900">{title}</h3>
      <p className="mb-3.5 mt-0.5 text-[11px] text-gray-400">{hint}</p>
      <div className="space-y-4">{children}</div>
    </section>
  );
}

function Field({ label, required, error, hint, children }: { label: string; required?: boolean; error?: string; hint?: string; children: ReactNode }) {
  return (
    <div>
      <label className={labelClass}>
        {label}
        {required && <span className="ml-0.5 text-[#F26F21]">*</span>}
      </label>
      {children}
      {hint && !error && <p className="mt-1 text-[11px] text-gray-400">{hint}</p>}
      {error && <p className="mt-1.5 flex items-center gap-1 text-[11px] font-semibold text-red-600">{error}</p>}
    </div>
  );
}
