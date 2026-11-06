// src/components/management/curriculum/CurriculumFormModal.tsx
// Create / edit form shared by the Cohorts and Curriculum pages (one backend record, two names).
// Operate-mode redesign: sectioned layout, inline hints, FPT orange focus.
import { useEffect, type ReactNode } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { GraduationCap, Loader2, X } from 'lucide-react';
import { cn } from '@/shared/lib/utils';
import { Modal } from '../../../../shared/components/ui/Modal';
import { useMajorsQuery } from '../../../academic/hooks/queries/useMajorsQuery';
import { useSemesterOptions } from '../../../academic/hooks/queries/useCurriculumsQuery';
import { curriculumFormSchema, type CurriculumFormValues } from '../../../academic/validations/curriculum.schema';
import type { CurriculumInput, CurriculumItem } from '../../../academic/types/curriculum';
import { SemesterCreator } from './SemesterCreator';

interface Props {
  open: boolean;
  noun: 'Cohort' | 'Curriculum';
  initial?: CurriculumItem | null;
  isSubmitting?: boolean;
  onClose: () => void;
  onSubmit: (body: CurriculumInput) => Promise<unknown>;
}

const field =
  'w-full rounded-xl border border-gray-200 bg-gray-50/50 px-3.5 py-2.5 text-[13px] font-medium text-gray-900 placeholder:font-normal placeholder:text-gray-400 transition-all focus:border-[#F26F21] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#F26F21]/20 disabled:cursor-not-allowed disabled:opacity-60';
const labelClass = 'mb-1.5 block text-[11px] font-extrabold uppercase tracking-[0.06em] text-gray-500';

const emptyValues: CurriculumFormValues = {
  majorId: '',
  version: '',
  name: '',
  effectiveFromSemesterId: '',
  effectiveToSemesterId: '',
  description: '',
  isCurrent: false,
  status: 'ACTIVE',
};

const toFormValues = (item: CurriculumItem): CurriculumFormValues => ({
  majorId: item.majorId,
  version: item.version,
  name: item.name,
  effectiveFromSemesterId: item.effectiveFromSemesterId,
  effectiveToSemesterId: item.effectiveToSemesterId ?? '',
  description: item.description ?? '',
  isCurrent: item.isCurrent,
  status: item.status,
});

export default function CurriculumFormModal({ open, noun, initial, isSubmitting, onClose, onSubmit }: Props) {
  const isCreate = !initial;
  const majors = useMajorsQuery({ page: 0, size: 100 });
  const semesters = useSemesterOptions(open);

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    setError,
    formState: { errors, isValid },
  } = useForm<CurriculumFormValues>({
    resolver: zodResolver(curriculumFormSchema),
    defaultValues: emptyValues,
    mode: 'onChange',
  });

  useEffect(() => {
    if (open) reset(initial ? toFormValues(initial) : emptyValues);
  }, [open, initial, reset]);

  const status = watch('status');
  const semesterList = semesters.data ?? [];
  const majorList = majors.data?.items ?? [];
  const isCurrentDisabled = status !== 'ACTIVE';

  const submit = handleSubmit(async (values) => {
    const from = semesterList.find((s) => s.id === values.effectiveFromSemesterId);
    const to = semesterList.find((s) => s.id === values.effectiveToSemesterId);
    if (from?.startDate && to?.startDate && to.startDate < from.startDate) {
      setError('effectiveToSemesterId', { message: 'The last semester cannot be before the first semester' });
      return;
    }
    if (values.isCurrent && values.status !== 'ACTIVE') {
      setError('isCurrent', { message: 'Only an active record can be the current one' });
      return;
    }
    try {
      await onSubmit({
        majorId: values.majorId,
        version: values.version.trim(),
        name: values.name.trim(),
        effectiveFromSemesterId: values.effectiveFromSemesterId,
        effectiveToSemesterId: values.effectiveToSemesterId || null,
        description: values.description?.trim() ? values.description.trim() : null,
        isCurrent: values.isCurrent,
        status: values.status,
      });
    } catch {
      // The error is shown by the mutation / global handler; keep the form open so it can be corrected.
    }
  });

  return (
    <Modal open={open} onClose={onClose} title={`${isCreate ? 'Create' : 'Edit'} ${noun.toLowerCase()}`} className="max-w-2xl">
      <form noValidate onSubmit={submit} className="flex min-h-0 flex-col">
        <div className="flex items-start justify-between gap-4 border-b border-gray-100 bg-gradient-to-r from-[#fff7ed] to-white px-6 py-5">
          <div className="flex items-start gap-3">
            <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-[#F26F21] to-[#C2410C] text-white shadow-[0_2px_8px_rgba(242,111,33,0.4)]">
              <GraduationCap className="size-5" />
            </span>
            <div>
              <h2 className="text-base font-extrabold tracking-tight text-gray-900">
                {isCreate ? `Create ${noun.toLowerCase()}` : `Edit ${noun.toLowerCase()}`}
              </h2>
              <p className="mt-0.5 text-xs leading-relaxed text-gray-500">
                A {noun.toLowerCase()} is one version (cohort) of a major — e.g. SE K19.
              </p>
            </div>
          </div>
          <button type="button" onClick={onClose} aria-label="Close" className="rounded-lg p-1.5 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-700">
            <X className="size-4" />
          </button>
        </div>

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
            {!semesters.isLoading && semesterList.length === 0 && (
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

        <div className="flex items-center justify-end gap-2.5 border-t border-gray-100 bg-gray-50/60 px-6 py-4">
          <button type="button" onClick={onClose} className="rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-xs font-bold text-gray-600 transition-colors hover:bg-gray-50 hover:text-gray-900">
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting || !isValid}
            title={!isValid ? 'Fill in Major, Cohort, Name and Start semester to continue' : undefined}
            className="inline-flex min-w-36 items-center justify-center gap-2 rounded-xl bg-[#F26F21] px-5 py-2.5 text-xs font-bold text-white shadow-[0_2px_8px_rgba(242,111,33,0.4)] transition-all hover:bg-[#e05f14] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSubmitting && <Loader2 className="size-3.5 animate-spin" />}
            {isSubmitting ? 'Saving…' : isCreate ? `Create ${noun.toLowerCase()}` : 'Save changes'}
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
