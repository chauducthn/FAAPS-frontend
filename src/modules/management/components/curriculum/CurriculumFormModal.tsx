// Create / edit form shared by the Cohorts and Curriculum pages (one backend record, two names).
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { GraduationCap, Loader2, X } from 'lucide-react';
import { Modal } from '../../../../shared/components/ui/Modal';
import { useMajorsQuery } from '../../../academic/hooks/queries/useMajorsQuery';
import { useSemesterOptions } from '../../../academic/hooks/queries/useCurriculumsQuery';
import { curriculumFormSchema, type CurriculumFormValues } from '../../../academic/validations/curriculum.schema';
import type { CurriculumInput, CurriculumItem } from '../../../academic/types/curriculum';
import { CurriculumFormFields } from './CurriculumFormFields';

interface Props {
  open: boolean;
  noun: 'Cohort' | 'Curriculum';
  initial?: CurriculumItem | null;
  isSubmitting?: boolean;
  onClose: () => void;
  onSubmit: (body: CurriculumInput) => Promise<unknown>;
}

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
      return;
    }
  });

  return (
    <Modal open={open} onClose={onClose} title={`${isCreate ? 'Create' : 'Edit'} ${noun.toLowerCase()}`} className="max-w-2xl">
      <form noValidate onSubmit={submit} className="flex min-h-0 flex-col">
        <div className="flex items-start justify-between gap-4 border-b border-gray-100 bg-[var(--brand-soft)] px-6 py-5">
          <div className="flex items-start gap-3">
            <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-[var(--brand)] text-white shadow-[0_2px_8px_rgba(242,111,33,0.4)]">
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

        <CurriculumFormFields
          noun={noun}
          status={status}
          isCurrentDisabled={isCurrentDisabled}
          majorList={majorList}
          semesterList={semesterList}
          isLoadingSemesters={semesters.isLoading}
          register={register}
          setValue={setValue}
          errors={errors}
        />

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
