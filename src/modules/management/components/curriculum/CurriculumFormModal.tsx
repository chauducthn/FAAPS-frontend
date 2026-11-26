// Create / edit modal shared by the Curriculum and Cohorts pages.
import { useEffect, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { GraduationCap, Loader2, X } from 'lucide-react';
import { Modal } from '../../../../shared/components/ui/Modal';
import { useMajorsQuery } from '../../../academic/hooks/queries/useMajorsQuery';
import { useSemesterOptions } from '../../../academic/hooks/queries/useCurriculumsQuery';
import { curriculumFormSchema, type CurriculumFormValues } from '../../../academic/validations/curriculum.schema';
import type { CurriculumInput, CurriculumItem } from '../../../academic/types/curriculum';
import { CurriculumFormFields } from './CurriculumFormFields';
import { MIN_END_TERM_GAP, semesterOrdinal } from './SemesterCreator';

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
  const nameTouchedRef = useRef(false);

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
    if (!open) return;
    nameTouchedRef.current = !isCreate;
    reset(initial ? toFormValues(initial) : emptyValues);
  }, [open, initial, isCreate, reset]);

  const status = watch('status');
  const majorId = watch('majorId');
  const version = watch('version');
  const displayName = watch('name');
  const startSemesterId = watch('effectiveFromSemesterId');
  const endSemesterId = watch('effectiveToSemesterId') ?? '';
  const semesterList = semesters.data ?? [];
  const majorList = majors.data?.items ?? [];
  const isCurrentDisabled = status !== 'ACTIVE';

  useEffect(() => {
    if (status !== 'ACTIVE') setValue('isCurrent', false, { shouldValidate: true });
  }, [status, setValue]);

  useEffect(() => {
    if (!open || !isCreate) return;
    const major = majorList.find((m) => m.id === majorId);
    if (noun === 'Cohort') {
      setValue('name', major ? major.name : '', { shouldValidate: Boolean(major) });
      return;
    }
    if (!major || nameTouchedRef.current) return;
    const cleanVersion = version.trim().toUpperCase();
    if (cleanVersion) {
      setValue('name', `${major.name} ${cleanVersion}`, { shouldValidate: true });
    }
  }, [open, isCreate, noun, majorId, version, majorList, setValue]);

  useEffect(() => {
    if (!startSemesterId || !endSemesterId) return;
    const fromOrd = semesterOrdinal(semesterList.find((s) => s.id === startSemesterId)?.code);
    const toEndOrd = semesterOrdinal(semesterList.find((s) => s.id === endSemesterId)?.code);
    if (fromOrd !== null && toEndOrd !== null && toEndOrd - fromOrd < MIN_END_TERM_GAP) {
      setValue('effectiveToSemesterId', '', { shouldValidate: true });
    }
  }, [startSemesterId, endSemesterId, semesterList, setValue]);

  const submit = handleSubmit(async (values) => {
    const from = semesterList.find((s) => s.id === values.effectiveFromSemesterId);
    const to = semesterList.find((s) => s.id === values.effectiveToSemesterId);
    if (from?.startDate && to?.startDate && to.startDate < from.startDate) {
      setError('effectiveToSemesterId', { message: 'End semester cannot be before start semester' });
      return;
    }
    try {
      await onSubmit({
        majorId: values.majorId,
        version: values.version.trim().toUpperCase(),
        name: values.name.trim(),
        effectiveFromSemesterId: values.effectiveFromSemesterId,
        effectiveToSemesterId: values.effectiveToSemesterId || null,
        description: values.description?.trim() ? values.description.trim() : null,
        isCurrent: values.status === 'ACTIVE' ? values.isCurrent : false,
        status: values.status,
      });
    } catch {
      return;
    }
  });

  return (
    <Modal open={open} onClose={() => !isSubmitting && onClose()} title={`${isCreate ? 'Create' : 'Edit'} ${noun.toLowerCase()}`} className="max-w-xl">
      <form noValidate onSubmit={submit} className="flex min-h-0 flex-col">
        <div className="flex items-center justify-between gap-4 border-b border-gray-100 bg-white px-6 py-4">
          <div className="flex items-center gap-3">
            <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-orange-50 text-[#F26F21] ring-1 ring-orange-200/70">
              <GraduationCap className="size-4.5" />
            </span>
            <div>
              <h2 className="text-[15px] font-semibold text-gray-900">
                {isCreate ? `Create ${noun.toLowerCase()}` : `Edit ${noun.toLowerCase()}`}
              </h2>
              <p className="text-[13px] text-gray-500">
                Configure major, cohort intake, and effective semester range.
              </p>
            </div>
          </div>
          <button
            type="button"
            disabled={isSubmitting}
            onClick={onClose}
            aria-label="Close"
            className="rounded-lg p-1.5 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-700 disabled:opacity-40"
          >
            <X className="size-4" />
          </button>
        </div>

        <CurriculumFormFields
          noun={noun}
          status={status}
          majorId={majorId}
          displayName={displayName}
          startSemesterId={startSemesterId}
          endSemesterId={endSemesterId}
          isCurrentDisabled={isCurrentDisabled}
          majorList={majorList}
          semesterList={semesterList}
          isLoadingSemesters={semesters.isLoading}
          register={register}
          setValue={setValue}
          errors={errors}
          onManualNameEdit={() => { nameTouchedRef.current = true; }}
        />

        <div className="flex items-center justify-end gap-2.5 border-t border-gray-100 bg-gray-50/70 px-6 py-3.5">
          <button
            type="button"
            disabled={isSubmitting}
            onClick={onClose}
            className="h-9 rounded-lg border border-gray-200 bg-white px-4 text-[13px] font-medium text-gray-700 transition-colors hover:bg-gray-50 disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting || !isValid}
            title={!isValid ? 'Fill in Major, Cohort, Name and Start semester to continue' : undefined}
            className="inline-flex h-9 items-center justify-center gap-2 rounded-lg bg-[#F26F21] px-4 text-[13px] font-semibold text-white transition-colors hover:bg-[#e05f14] disabled:cursor-not-allowed disabled:opacity-55"
          >
            {isSubmitting && <Loader2 className="size-4 animate-spin" />}
            {isSubmitting ? 'Saving…' : isCreate ? `Create ${noun.toLowerCase()}` : 'Save changes'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
