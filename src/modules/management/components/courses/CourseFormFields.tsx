import type { ReactNode } from 'react';
import { Controller, type Control, type FieldErrors, type UseFormRegister } from 'react-hook-form';
import { cn } from '@/shared/lib/utils';
import { CREDIT_OPTIONS, type CreateCourseFormValues } from '../../../academic/validations/course.schema';
import type { CourseCategory } from '../../../academic/types/course';
import PrerequisitePicker from './PrerequisitePicker';

const field =
  'w-full rounded-xl border border-gray-200 bg-gray-50/50 px-3.5 py-2.5 text-[13px] font-medium text-gray-900 placeholder:font-normal placeholder:text-gray-400 transition-all focus:border-[#F26F21] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#F26F21]/20 disabled:cursor-not-allowed disabled:opacity-60';
const labelClass = 'mb-1.5 block text-[11px] font-extrabold uppercase tracking-[0.06em] text-gray-500';

interface Props {
  isCreate: boolean;
  categories: CourseCategory[];
  status: 'ACTIVE' | 'INACTIVE';
  code: string;
  register: UseFormRegister<CreateCourseFormValues>;
  control: Control<CreateCourseFormValues>;
  errors: FieldErrors<CreateCourseFormValues>;
}

export function CourseFormFields({ isCreate, categories, status, code, register, control, errors }: Props) {
  return (
    <>
      <Section title="Identity" hint="The code is uppercase and unique — it is what roadmaps and transcripts print.">
        <div className="grid gap-4 sm:grid-cols-3">
          <Field label="Code" required error={errors.code?.message} hint="e.g. SE101, MA003">
            <input {...register('code')} placeholder="SE101" className={cn(field, 'font-mono font-bold uppercase')} aria-label="Course code" />
          </Field>
          <Field label="Credits" required error={errors.credits?.message}>
            <select {...register('credits', { valueAsNumber: true })} aria-label="Credits" className={cn(field, 'font-mono font-bold tabular-nums')}>
              <option value="">Select…</option>
              {CREDIT_OPTIONS.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Category" required error={errors.categoryId?.message}>
            <select {...register('categoryId')} aria-label="Category" className={field}>
              <option value="">Select a category…</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.code} - {c.name}
                </option>
              ))}
            </select>
          </Field>
        </div>
        <Field label="Name" required error={errors.name?.message}>
          <input {...register('name')} placeholder="Introduction to Programming" aria-label="Course name" className={field} />
        </Field>
        <Field label="Status" error={errors.status?.message} hint={isCreate ? 'New courses are Active unless you choose Inactive.' : undefined}>
          <div className="grid grid-cols-2 gap-1 rounded-xl bg-gray-100 p-1" role="radiogroup" aria-label="Status">
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
      </Section>

      <Section
        title={isCreate ? 'Prerequisites & materials' : 'Materials'}
        hint={isCreate ? 'Both are optional. More relations can be managed later from the course detail.' : 'Prerequisites are managed from the course detail.'}
      >
        {isCreate && (
          <Field label="Prerequisites" hint="Students must pass every course listed here first.">
            <Controller
              control={control}
              name="prerequisiteIds"
              render={({ field: f }) => <PrerequisitePicker value={f.value ?? []} onChange={f.onChange} excludeCode={code} />}
            />
          </Field>
        )}
        <Field label="Material link" error={errors.materialLink?.message} hint="Slides, syllabus PDF or a shared folder, e.g. https://drive.google.com/…">
          <input type="url" {...register('materialLink')} placeholder="https://" aria-label="Material link" className={field} />
        </Field>
      </Section>
    </>
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
