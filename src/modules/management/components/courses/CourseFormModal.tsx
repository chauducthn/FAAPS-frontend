// Create / edit form for the Courses catalogue.
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { BookOpenText, SpinnerGap as Loader2, X } from '@phosphor-icons/react';
import { Modal } from '../../../../shared/components/ui/Modal';
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
        materialLink: initial.materialLink ?? '',
        prerequisiteIds: initial.relations
          .filter((r) => r.kind === 'PREREQUISITE')
          .map((r) => r.otherCourseId),
      });
    } else {
      reset(EMPTY_DEFAULTS);
    }
  }, [open, initial, reset]);

  const status = watch('status');
  const code = watch('code') ?? '';
  const showCodeError = isSubmitted || code.trim().length >= 6;
  const codeError = showCodeError ? errors.code?.message : undefined;
  const canSubmit = !isLoading && !isLoadingInitial && isValid;

  return (
    <Modal open={open} onClose={onClose} title={isCreate ? 'Create course' : 'Edit course'} className="max-w-xl">
      <form noValidate onSubmit={handleSubmit(onSubmit)} className="flex min-h-0 flex-col">
        <div className="flex items-center justify-between gap-4 border-b border-gray-100 bg-white px-6 py-4">
          <div className="flex items-center gap-3">
            <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-orange-50 text-[#F26F21] ring-1 ring-orange-200/70">
              <BookOpenText className="size-4.5" />
            </span>
            <div>
              <h2 className="text-[15px] font-semibold text-gray-900">
                {isCreate ? 'Create course' : `Edit ${initial?.code ?? 'course'}`}
              </h2>
              <p className="text-[13px] text-gray-500">
                {isCreate
                  ? 'Configure course code, credits, category, and optional prerequisites.'
                  : 'Update course details — curriculums referencing this course sync automatically.'}
              </p>
            </div>
          </div>
          <button type="button" onClick={onClose} aria-label="Close" className="rounded-lg p-1.5 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-700">
            <X className="size-4" />
          </button>
        </div>

        <div className="space-y-4 overflow-y-auto px-6 py-5 text-[13px]">
          {isLoadingInitial ? (
            <div className="space-y-3" aria-label="Loading course">
              {[0, 1, 2].map((i) => (
                <div key={i} className="h-10 animate-pulse rounded-lg bg-gray-100" style={{ animationDelay: `${i * 80}ms` }} />
              ))}
              <p className="text-center text-xs font-medium text-gray-400">Loading course…</p>
            </div>
          ) : (
            <CourseFormFields
              isCreate={isCreate}
              categories={categories}
              status={status ?? 'ACTIVE'}
              code={code}
              codeError={codeError}
              register={register}
              control={control}
              errors={errors}
            />
          )}
        </div>

        <div className="flex items-center justify-end gap-2.5 border-t border-gray-100 bg-gray-50/70 px-6 py-3.5">
          <button type="button" onClick={onClose} className="h-9 rounded-lg border border-gray-200 bg-white px-4 text-[13px] font-medium text-gray-700 transition-colors hover:bg-gray-50">
            Cancel
          </button>
          <button
            type="submit"
            disabled={!canSubmit}
            title={!canSubmit ? 'Fill in a valid Course code, Credits, Category and Name to continue' : undefined}
            className="inline-flex h-9 items-center justify-center gap-2 rounded-lg bg-[#F26F21] px-4 text-[13px] font-semibold text-white transition-colors hover:bg-[#e05f14] disabled:cursor-not-allowed disabled:opacity-55"
          >
            {isLoading && <Loader2 className="size-4 animate-spin" />}
            {isLoadingInitial ? 'Loading…' : isLoading ? 'Saving…' : isCreate ? 'Create course' : 'Save changes'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
