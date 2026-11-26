import type { ReactNode } from 'react';
import { ChevronDown } from 'lucide-react';
import { Controller, type Control, type FieldErrors, type UseFormRegister } from 'react-hook-form';
import { cn } from '@/shared/lib/utils';
import { CREDIT_OPTIONS, type CreateCourseFormValues } from '../../../academic/validations/course.schema';
import type { CourseCategory } from '../../../academic/types/course';
import PrerequisitePicker from './PrerequisitePicker';

const inputClass = (hasError?: boolean) =>
  cn(
    'h-10 w-full rounded-lg border bg-white px-3 text-[13px] text-gray-900 placeholder:text-gray-400 shadow-2xs transition-colors focus:outline-none focus:ring-2 disabled:cursor-not-allowed disabled:bg-gray-50 disabled:opacity-60',
    hasError
      ? 'border-red-300 focus:border-red-500 focus:ring-red-100'
      : 'border-gray-200 hover:border-gray-300 focus:border-[#F26F21] focus:ring-[#F26F21]/15',
  );

interface Props {
  isCreate: boolean;
  categories: CourseCategory[];
  status: 'ACTIVE' | 'INACTIVE';
  code: string;
  codeError?: string;
  register: UseFormRegister<CreateCourseFormValues>;
  control: Control<CreateCourseFormValues>;
  errors: FieldErrors<CreateCourseFormValues>;
}

export function CourseFormFields({
  isCreate,
  categories,
  status,
  code,
  codeError,
  register,
  control,
  errors,
}: Props) {
  return (
    <div className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-3">
        <Field label="Course code" required error={codeError}>
          <input
            {...register('code')}
            maxLength={20}
            placeholder="e.g. CSD201, SSL101c, PEN"
            aria-label="Course code"
            className={cn(inputClass(!!codeError), 'font-mono font-semibold placeholder:font-sans placeholder:font-normal')}
          />
        </Field>

        <Field label="Credits" required error={errors.credits?.message}>
          <div className="relative">
            <select
              {...register('credits', { valueAsNumber: true })}
              aria-label="Credits"
              className={cn(inputClass(!!errors.credits), 'appearance-none pr-9 tabular-nums')}
            >
              <option value="">Select…</option>
              {CREDIT_OPTIONS.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
            <ChevronDown className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-gray-400" />
          </div>
        </Field>

        <Field label="Category" required error={errors.categoryId?.message}>
          <div className="relative">
            <select
              {...register('categoryId')}
              aria-label="Category"
              className={cn(inputClass(!!errors.categoryId), 'appearance-none pr-9')}
            >
              <option value="">Select category…</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>{c.code} — {c.name}</option>
              ))}
            </select>
            <ChevronDown className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-gray-400" />
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

      <div className="grid items-start gap-4 sm:grid-cols-2">
        <Field label="Status" error={errors.status?.message}>
          <div className="grid h-10 grid-cols-2 gap-1 rounded-lg border border-gray-200 bg-gray-50 p-1" role="radiogroup" aria-label="Status">
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

        <Field label="Material link" optional error={errors.materialLink?.message}>
          <input
            type="url"
            {...register('materialLink')}
            placeholder="https://drive.google.com/…"
            aria-label="Material link"
            className={inputClass(!!errors.materialLink)}
          />
        </Field>
      </div>

      {isCreate && (
        <Field label="Prerequisites" optional>
          <Controller
            control={control}
            name="prerequisiteIds"
            render={({ field: f }) => <PrerequisitePicker value={f.value ?? []} onChange={f.onChange} excludeCode={code} />}
          />
        </Field>
      )}
    </div>
  );
}

function Field({ label, required, optional, error, children }: {
  label: string; required?: boolean; optional?: boolean; error?: string; children: ReactNode;
}) {
  return (
    <div>
      <label className="mb-1.5 block text-[13px] font-medium text-gray-700">
        {label}
        {required && <span className="ml-0.5 text-[#F26F21]">*</span>}
        {optional && <span className="ml-1 text-xs font-normal text-gray-400">(optional)</span>}
      </label>
      {children}
      {error && <p className="mt-1 text-xs font-medium text-red-600">{error}</p>}
    </div>
  );
}
