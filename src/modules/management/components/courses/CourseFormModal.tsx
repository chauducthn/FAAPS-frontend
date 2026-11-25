// Create / edit form for the Courses catalogue.
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { BookOpenText, Loader2, X } from 'lucide-react';
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
    formState: { errors, isValid },
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
      });
    } else {
      reset(EMPTY_DEFAULTS);
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
            <CourseFormFields
              isCreate={isCreate}
              categories={categories}
              status={status ?? 'ACTIVE'}
              code={code}
              register={register}
              control={control}
              errors={errors}
            />
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
