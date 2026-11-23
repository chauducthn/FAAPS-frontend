// Create / edit form for the Courses catalogue.
// Operate-mode redesign synced with CurriculumFormModal: gradient header,
// sectioned layout, inline hints, FPT orange focus.
import { useEffect, type ReactNode } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { BookOpenText, Loader2, X } from 'lucide-react';
import { Modal } from '../../../../shared/components/ui/Modal';
import { cn } from '@/shared/lib/utils';
import {
  CREDIT_OPTIONS,
  createCourseSchema,
  type CreateCourseFormValues,
} from '../../../academic/validations/course.schema';
import type { CourseCategory, CourseDetail } from '../../../academic/types/course';
import PrerequisitePicker from './PrerequisitePicker';

interface Props {
  open: boolean;
  mode: 'create' | 'edit';
  /** Full course, loaded for editing. */
  initial?: CourseDetail | null;
  isLoadingInitial?: boolean;
  categories: CourseCategory[];
  isLoading?: boolean;
  onClose: () => void;
  onSubmit: (values: CreateCourseFormValues) => void;
}

const field =
  'w-full rounded-xl border border-gray-200 bg-gray-50/50 px-3.5 py-2.5 text-[13px] font-medium text-gray-900 placeholder:font-normal placeholder:text-gray-400 transition-all focus:border-[#F26F21] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#F26F21]/20 disabled:cursor-not-allowed disabled:opacity-60';
const labelClass = 'mb-1.5 block text-[11px] font-extrabold uppercase tracking-[0.06em] text-gray-500';

export default function CourseFormModal({
  open,
  mode,
  initial,
  categories,
  isLoading,
  isLoadingInitial,
  onClose,
  onSubmit,
}: Props) {
  const isCreate = mode === 'create';

  const {
    register,
    control,
    handleSubmit,
    reset,
    watch,
    formState: { errors, isValid },
  } = useForm<CreateCourseFormValues>({
    resolver: zodResolver(createCourseSchema),
    defaultValues: { code: '', name: '', credits: Number.NaN, categoryId: '', status: 'ACTIVE', materialLink: '', prerequisiteIds: [] },
    // Validate on change and on blur, so leaving a required field empty shows its message.
    mode: 'all',
  });

  useEffect(() => {
    if (!open) return;
    if (initial) {
      reset({
        code: initial.code,
        name: initial.name,
        credits: initial.credits,
        categoryId: initial.categoryId,
        status: initial.status,
        materialLink: initial.materialLink ?? '',
      });
    } else {
      reset({ code: '', name: '', credits: Number.NaN, categoryId: '', status: 'ACTIVE', materialLink: '', prerequisiteIds: [] });
    }
  }, [open, initial, reset]);

  const status = watch('status');
  const code = watch('code');

  return (
    <Modal open={open} onClose={onClose} title={isCreate ? 'Create course' : 'Edit course'} className="max-w-2xl">
      <form noValidate onSubmit={handleSubmit(onSubmit)} className="flex min-h-0 flex-col">
        <div className="flex items-start justify-between gap-4 border-b border-gray-100 bg-gradient-to-r from-[#fff7ed] to-white px-6 py-5">
          <div className="flex items-start gap-3">
            <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-[#F26F21] to-[#C2410C] text-white shadow-[0_2px_8px_rgba(242,111,33,0.4)]">
              <BookOpenText className="size-5" />
            </span>
            <div>
              <h2 className="text-base font-extrabold tracking-tight text-gray-900">
                {isCreate ? 'Create course' : `Edit ${initial?.code ?? 'course'}`}
              </h2>
              <p className="mt-0.5 text-xs leading-relaxed text-gray-500">
                {isCreate
                  ? 'Add a new course to the master catalogue — it becomes pickable in every curriculum.'
                  : 'Update the catalogue entry — roadmaps referencing this course update automatically.'}
              </p>
            </div>
          </div>
          <button type="button" onClick={onClose} aria-label="Close" className="rounded-lg p-1.5 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-700">
            <X className="size-4" />
          </button>
        </div>

        <div className="space-y-5 overflow-y-auto px-6 py-6 text-[13px]">
          {isLoadingInitial ? (
            <div className="space-y-3" aria-label="Loading course">
              {[0, 1, 2].map((i) => (
                <div key={i} className="h-12 animate-pulse rounded-xl bg-gray-100" style={{ animationDelay: `${i * 80}ms` }} />
              ))}
              <p className="text-center text-[11px] font-medium text-gray-400">Loading course…</p>
            </div>
          ) : (
            <>
              <Section title="Identity" hint="The code is uppercase and unique — it is what roadmaps and transcripts print.">
                <div className="grid gap-4 sm:grid-cols-3">
                  <Field label="Code" required error={errors.code?.message} hint="e.g. SE101, MA003">
                    <input {...register('code')} placeholder="SE101" className={cn(field, 'font-mono font-bold uppercase')} aria-label="Course code" />
                  </Field>
                  <Field label="Credits" required error={errors.credits?.message}>
                    <select
                      {...register('credits', { valueAsNumber: true })}
                      aria-label="Credits"
                      className={cn(field, 'font-mono font-bold tabular-nums')}
                    >
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
          )}
        </div>

        <div className="flex items-center justify-end gap-2.5 border-t border-gray-100 bg-gray-50/60 px-6 py-4">
          <button type="button" onClick={onClose} className="rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-xs font-bold text-gray-600 transition-colors hover:bg-gray-50 hover:text-gray-900">
            Cancel
          </button>
          <button
            type="submit"
            disabled={isLoading || isLoadingInitial || !isValid}
            title={!isValid ? 'Fill in Code, Credits, Category and Name to continue' : undefined}
            className="inline-flex min-w-36 items-center justify-center gap-2 rounded-xl bg-[#F26F21] px-5 py-2.5 text-xs font-bold text-white shadow-[0_2px_8px_rgba(242,111,33,0.4)] transition-all hover:bg-[#e05f14] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isLoading && <Loader2 className="size-3.5 animate-spin" />}
            {isLoadingInitial ? 'Loading…' : isLoading ? 'Saving…' : isCreate ? 'Create course' : 'Save changes'}
          </button>
        </div>
      </form>
    </Modal>
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

function Field({ label, required, error, hint, children }: { label: string; required?: boolean; error?: string; hint?: string; children: React.ReactNode }) {
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
