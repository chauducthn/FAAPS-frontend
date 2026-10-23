// src/components/admin/curriculum/CurriculumFormModal.tsx
// Create / edit form shared by the Cohorts and Curriculum pages (one backend record, two names).
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { X } from 'lucide-react';
import { Modal } from '../../ui/Modal';
import { useMajorsQuery } from '../../../hooks/queries/useMajorsQuery';
import { useSemesterOptions } from '../../../hooks/queries/useCurriculumsQuery';
import { curriculumFormSchema, type CurriculumFormValues } from '../../../validations/curriculum.schema';
import type { CurriculumInput, CurriculumItem } from '../../../types/curriculum';

interface Props {
  open: boolean;
  noun: 'Cohort' | 'Curriculum';
  initial?: CurriculumItem | null;
  isSubmitting?: boolean;
  onClose: () => void;
  onSubmit: (body: CurriculumInput) => Promise<unknown>;
}

const field = 'w-full rounded-lg border border-gray-200 bg-white px-3 py-2 focus:border-[#F26F21] focus:outline-none disabled:bg-gray-50';
const labelClass = 'mb-1 block text-[11px] font-bold uppercase text-gray-600';

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
    setError,
    formState: { errors },
  } = useForm<CurriculumFormValues>({ resolver: zodResolver(curriculumFormSchema), defaultValues: emptyValues });

  useEffect(() => {
    if (open) reset(initial ? toFormValues(initial) : emptyValues);
  }, [open, initial, reset]);

  const status = watch('status');
  const semesterList = semesters.data ?? [];
  const majorList = majors.data?.items ?? [];

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
      <form noValidate onSubmit={submit} className="flex min-h-0 flex-col text-xs">
        <div className="flex items-start justify-between border-b border-gray-100 px-6 py-4">
          <div>
            <h2 className="text-base font-bold text-gray-900">{isCreate ? `Create ${noun.toLowerCase()}` : `Edit ${noun.toLowerCase()}`}</h2>
            <p className="mt-0.5 text-gray-500">
              A {noun.toLowerCase()} is one version (cohort) of a major, for example SE K19.
            </p>
          </div>
          <button type="button" onClick={onClose} aria-label="Close" className="rounded p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-700">
            <X className="size-4" />
          </button>
        </div>

        <div className="space-y-4 overflow-y-auto px-6 py-5">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Major" required error={errors.majorId?.message}>
              <select {...register('majorId')} className={field} aria-label="Major">
                <option value="">Select a major...</option>
                {majorList.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.code} - {m.name}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Cohort (version)" required error={errors.version?.message}>
              <input {...register('version')} placeholder="K19" className={field} aria-label="Cohort version" />
            </Field>
          </div>

          <Field label="Name" required error={errors.name?.message}>
            <input {...register('name')} placeholder="Software Engineering 2024-2028" className={field} aria-label="Name" />
          </Field>

          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Effective from semester" required error={errors.effectiveFromSemesterId?.message}>
              <select {...register('effectiveFromSemesterId')} className={field} aria-label="Effective from semester">
                <option value="">Select a semester...</option>
                {semesterList.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.code}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Effective until semester" error={errors.effectiveToSemesterId?.message}>
              <select {...register('effectiveToSemesterId')} className={field} aria-label="Effective until semester">
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
            <p className="text-[11px] text-amber-700">
              No semesters are available yet. The backend has no semester list API, so semesters can only be chosen from ones
              already used by an existing cohort.
            </p>
          )}

          <Field label="Description" error={errors.description?.message}>
            <textarea rows={3} {...register('description')} className={field} aria-label="Description" />
          </Field>

          <div className="grid items-start gap-4 sm:grid-cols-2">
            <Field label="Status" error={errors.status?.message}>
              <select {...register('status')} className={field} aria-label="Status">
                <option value="ACTIVE">Active</option>
                <option value="INACTIVE">Inactive</option>
              </select>
            </Field>
            <div>
              <span className={labelClass}>Current</span>
              <label className="flex cursor-pointer items-center gap-2 py-2 text-gray-800">
                <input type="checkbox" {...register('isCurrent')} disabled={status !== 'ACTIVE'} className="size-4 rounded border-gray-300 accent-[#F26F21]" />
                Use as the current {noun.toLowerCase()} of this major
              </label>
              {errors.isCurrent?.message && <p className="text-[11px] text-red-600">{errors.isCurrent.message}</p>}
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end gap-2.5 border-t border-gray-100 px-6 py-4">
          <button type="button" onClick={onClose} className="rounded-lg border border-gray-200 px-4 py-2 font-semibold text-gray-700 hover:bg-gray-50">
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="rounded-lg bg-[#F26F21] px-4 py-2 font-bold text-white hover:bg-[#e05f14] disabled:opacity-60"
          >
            {isSubmitting ? 'Saving...' : isCreate ? `Create ${noun.toLowerCase()}` : 'Save changes'}
          </button>
        </div>
      </form>
    </Modal>
  );
}

function Field({ label, required, error, children }: { label: string; required?: boolean; error?: string; children: React.ReactNode }) {
  return (
    <div>
      <label className={labelClass}>
        {label}
        {required && <span className="text-red-500"> *</span>}
      </label>
      {children}
      {error && <p className="mt-1 text-[11px] text-red-600">{error}</p>}
    </div>
  );
}
