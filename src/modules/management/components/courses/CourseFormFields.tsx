import type { ReactNode } from 'react';
import { CaretDown as ChevronDown } from '@phosphor-icons/react';
import { Controller, type Control, type FieldErrors, type UseFormRegister } from 'react-hook-form';
import { cn } from '@/shared/lib/utils';
import { CREDIT_OPTIONS, type CreateCourseFormValues } from '../../../academic/validations/course.schema';
import type { CourseCategory } from '../../../academic/types/course';
import PrerequisitePicker, { type PrerequisiteOption } from './PrerequisitePicker';

const inputClass = (hasError?: boolean) =>
  cn(
    'h-9 w-full rounded-md border bg-white px-3 text-[13px] text-ink-primary placeholder:text-ink-subtle',
    'shadow-2xs transition-colors focus:outline-none focus:ring-2',
    'disabled:cursor-not-allowed disabled:bg-surface-page disabled:opacity-60',
    hasError
      ? 'border-red-300 focus:border-red-500 focus:ring-red-100'
      : 'border-line hover:border-ink-subtle/60 focus:border-brand focus:ring-brand/15',
  );

const EYEBROW = 'text-[11px] font-semibold uppercase tracking-[0.12em] text-ink-subtle';

interface Props {
  isCreate: boolean;
  categories: CourseCategory[];
  status: 'ACTIVE' | 'INACTIVE';
  code: string;
  codeError?: string;
  initialPrerequisites?: PrerequisiteOption[];
  register: UseFormRegister<CreateCourseFormValues>;
  control: Control<CreateCourseFormValues>;
  errors: FieldErrors<CreateCourseFormValues>;
}

export function CourseFormFields({
  categories,
  status,
  code,
  codeError,
  initialPrerequisites,
  register,
  control,
  errors,
}: Props) {
  return (
    <div className="grid gap-6 md:grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)] md:items-stretch">
      <div className="flex flex-col space-y-3.5 md:py-4">
        <p className={EYEBROW}>Course identity</p>

        <div className="grid grid-cols-[minmax(0,1.35fr)_minmax(0,1fr)] gap-3">
          <Field label="Course code" required error={codeError}>
            <input
              {...register('code')}
              maxLength={20}
              placeholder="e.g. CSD201"
              aria-label="Course code"
              className={cn(inputClass(!!codeError), 'font-mono font-semibold placeholder:font-sans placeholder:font-normal')}
            />
          </Field>

          <Field label="Credits" required error={errors.credits?.message}>
            <div className="relative">
              <select
                {...register('credits', { valueAsNumber: true })}
                aria-label="Credits"
                className={cn(inputClass(!!errors.credits), 'appearance-none pr-8 tabular-nums')}
              >
                <option value="">Select…</option>
                {CREDIT_OPTIONS.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
              <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 size-3.5 -translate-y-1/2 text-ink-subtle" />
            </div>
          </Field>
        </div>

        <Field label="Course name" required error={errors.name?.message}>
          <input
            {...register('name')}
            placeholder="e.g. Data Structures and Algorithms"
            aria-label="Course name"
            className={inputClass(!!errors.name)}
          />
        </Field>

        <Field label="Category" required error={errors.categoryId?.message}>
          <div className="relative">
            <select
              {...register('categoryId')}
              aria-label="Category"
              className={cn(inputClass(!!errors.categoryId), 'appearance-none pr-8')}
            >
              <option value="">Select category…</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>{c.code} — {c.name}</option>
              ))}
            </select>
            <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 size-3.5 -translate-y-1/2 text-ink-subtle" />
          </div>
        </Field>

        <Field label="Status" error={errors.status?.message}>
          <div
            className="grid h-9 grid-cols-2 gap-1 rounded-md border border-line bg-surface-page p-0.5"
            role="radiogroup"
            aria-label="Status"
          >
            {(['ACTIVE', 'INACTIVE'] as const).map((s) => (
              <label
                key={s}
                className={cn(
                  'flex cursor-pointer items-center justify-center rounded-[6px] text-[13px] font-medium transition-colors',
                  status === s
                    ? s === 'ACTIVE'
                      ? 'bg-white font-semibold text-emerald-700 shadow-2xs ring-1 ring-emerald-200'
                      : 'bg-white font-semibold text-ink-primary shadow-2xs ring-1 ring-line'
                    : 'text-ink-muted hover:text-ink-primary',
                )}
              >
                <input type="radio" value={s} {...register('status')} className="sr-only" />
                {s === 'ACTIVE' ? 'Active' : 'Inactive'}
              </label>
            ))}
          </div>
        </Field>
      </div>

      <div className="flex h-full flex-col space-y-3.5 rounded-lg border border-line bg-surface-page p-4">
        <p className={EYEBROW}>Academic settings</p>

        <Field label="Workload override" optional error={errors.workloadLevel?.message}>
          <div className="relative">
            <select
              {...register('workloadLevel')}
              aria-label="Workload override"
              className={cn(inputClass(!!errors.workloadLevel), 'appearance-none pr-8')}
            >
              <option value="AUTO">Auto (Rule + Historical data)</option>
              <option value="LIGHT">Light</option>
              <option value="MEDIUM">Medium</option>
              <option value="HEAVY">Heavy</option>
            </select>
            <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 size-3.5 -translate-y-1/2 text-ink-subtle" />
          </div>
        </Field>

        <Field label="Material link" optional error={errors.materialLink?.message}>
          <input
            type="url"
            {...register('materialLink')}
            placeholder="https://drive.google.com/…"
            aria-label="Material link"
            className={inputClass(!!errors.materialLink)}
          />
        </Field>

        <Field label="Prerequisites" optional>
          <Controller
            control={control}
            name="prerequisiteIds"
            render={({ field: f }) => (
              <PrerequisitePicker
                value={f.value ?? []}
                onChange={f.onChange}
                excludeCode={code}
                initialOptions={initialPrerequisites}
              />
            )}
          />
        </Field>
      </div>
    </div>
  );
}

function Field({ label, required, optional, error, children }: {
  label: string; required?: boolean; optional?: boolean; error?: string; children: ReactNode;
}) {
  return (
    <div>
      <label className="mb-1.5 block text-[13px] font-medium text-ink-secondary">
        {label}
        {required && <span className="ml-0.5 text-brand">*</span>}
        {optional && <span className="ml-1 text-xs font-normal text-ink-subtle">(optional)</span>}
      </label>
      {children}
      {error && <p className="mt-1 text-xs font-medium text-red-600">{error}</p>}
    </div>
  );
}
