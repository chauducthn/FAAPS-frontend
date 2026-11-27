// Create / edit form for the Courses catalogue.
import { useEffect, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { BookOpenText, SpinnerGap as Loader2 } from '@phosphor-icons/react';
import { Modal } from '../../../../shared/components/ui/Modal';
import { ModalBody, ModalFooter, ModalHeader, modalButtonClass } from '../../../../shared/components/ui/ModalParts';
import { createCourseSchema, type CreateCourseFormValues } from '../../../academic/validations/course.schema';
import type { CourseCategory, CourseDetail } from '../../../academic/types/course';
import { CourseFormFields } from './CourseFormFields';

interface Props {
  open: boolean;
  mode: 'create' | 'edit';
  initial?: CourseDetail | null;
  isLoadingInitial?: boolean;
  categories: CourseCategory[];
  isLoading?: boolean;
  onClose: () => void;
  onSubmit: (values: CreateCourseFormValues) => void;
}

const EMPTY_DEFAULTS: CreateCourseFormValues = {
  code: '',
  name: '',
  credits: Number.NaN,
  categoryId: '',
  status: 'ACTIVE',
  workloadLevel: 'AUTO',
  materialLink: '',
  prerequisiteIds: [],
};

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
    formState: { errors, isValid, isSubmitted },
  } = useForm<CreateCourseFormValues>({
    resolver: zodResolver(createCourseSchema),
    defaultValues: EMPTY_DEFAULTS,
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
        workloadLevel: initial.workload?.manualLevel ?? 'AUTO',
        materialLink: initial.materialLink ?? '',
        prerequisiteIds: initial.relations
          .filter((r) => r.kind === 'PREREQUISITE')
          .map((r) => r.otherCourseId),
      });
    } else {
      reset(EMPTY_DEFAULTS);
    }
  }, [open, initial, reset]);

  const initialPrerequisites = useMemo(
    () =>
      (initial?.relations ?? [])
        .filter((r) => r.kind === 'PREREQUISITE')
        .map((r) => ({ id: r.otherCourseId, code: r.otherCourseCode, name: r.otherCourseName })),
    [initial],
  );

  const status = watch('status');
  const code = watch('code') ?? '';
  const showCodeError = isSubmitted || code.trim().length >= 6;
  const codeError = showCodeError ? errors.code?.message : undefined;
  const canSubmit = !isLoading && !isLoadingInitial && isValid;

  return (
    <Modal open={open} onClose={onClose} title={isCreate ? 'Create course' : 'Edit course'} className="max-w-[760px]">
      <form noValidate onSubmit={handleSubmit(onSubmit)} className="flex min-h-0 flex-col">
        <ModalHeader
          icon={<BookOpenText aria-hidden />}
          tone="brand"
          title={isCreate ? 'Create course' : `Edit ${initial?.code ?? 'course'}`}
          description={
            isCreate
              ? 'Configure course code, credits, category, and optional prerequisites.'
              : 'Update course details — curriculums referencing this course sync automatically.'
          }
          onClose={onClose}
        />

        <ModalBody className="space-y-4 text-[13px]">
          {isLoadingInitial ? (
            <div className="space-y-3" aria-label="Loading course">
              {[0, 1, 2].map((i) => (
                <div key={i} className="h-9 animate-pulse rounded-md bg-line-soft" />
              ))}
              <p className="text-center text-xs font-medium text-ink-subtle">Loading course…</p>
            </div>
          ) : (
            <CourseFormFields
              isCreate={isCreate}
              categories={categories}
              status={status ?? 'ACTIVE'}
              code={code}
              codeError={codeError}
              initialPrerequisites={initialPrerequisites}
              register={register}
              control={control}
              errors={errors}
            />
          )}
        </ModalBody>

        <ModalFooter>
          <button type="button" onClick={onClose} className={modalButtonClass('secondary')}>
            Cancel
          </button>
          <button
            type="submit"
            disabled={!canSubmit}
            title={!canSubmit ? 'Fill in a valid Course code, Credits, Category and Name to continue' : undefined}
            className={modalButtonClass('primary')}
          >
            {isLoading && <Loader2 className="size-4 animate-spin" aria-hidden />}
            {isCreate ? 'Create course' : 'Save changes'}
          </button>
        </ModalFooter>
      </form>
    </Modal>
  );
}
